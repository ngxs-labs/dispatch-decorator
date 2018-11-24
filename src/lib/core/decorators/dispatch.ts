import { Store } from '@ngxs/store';

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { InjectorAccessor } from '../services/injector-accessor.service';
import { DispatchedEvent, isValidEvent, descriptorExists, eventIsPlainObject, isObservable, isPromise } from '../internal/internals';
import { DispatchAction } from '../actions/actions';

/**
 * @internal
 * @param target - Parent class that contains decorated property
 * @param key - Decorated key
 */
function dispatchEvent(target: any, key: string | symbol) {
    const store = InjectorAccessor.getInjector().get<Store>(Store);

    return (event: DispatchedEvent) => {
        const isInvalidEvent = !isValidEvent(event);

        if (isInvalidEvent) {
            throw new Error(`Your method \`${target.name}.${key.toString()}\` seems to return an invalid object`);
        }

        if (eventIsPlainObject(event)) {
            DispatchAction.type = event.type;
            store.dispatch(new DispatchAction(event.payload));
        } else {
            store.dispatch(event);
        }
    };
}

/**
 * @returns - A factory for decorating methods/properties
 */
export function Dispatch(): PropertyDecorator {
    return (target: any, key: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) => {
        let originalValue: Function = null!;

        const wrapped = function(...args: any[]) {
            const event: Observable<DispatchedEvent> | Promise<DispatchedEvent> = originalValue.apply(target, args);

            if (isObservable(event)) {
                event.pipe(first()).subscribe(dispatchEvent(target, key));
            } else if (isPromise(event)) {
                event.then(dispatchEvent(target, key));
            } else {
                dispatchEvent(target, key)(event);
            }
        };

        const methodDecorated = descriptorExists(descriptor);

        if (methodDecorated) {
            originalValue = descriptor!.value!;
            descriptor!.value = wrapped;
        } else {
            Object.defineProperty(target, key, {
                set: (lambda: Function) => {
                    originalValue = lambda;
                },
                get: () => wrapped
            });
        }
    };
}
