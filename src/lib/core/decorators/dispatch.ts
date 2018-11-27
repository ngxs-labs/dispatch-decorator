import { NgZone } from '@angular/core';
import { Store } from '@ngxs/store';

import { isObservable } from 'rxjs';
import { first } from 'rxjs/operators';

import { InjectorAccessor } from '../services/injector-accessor.service';
import { DispatchAction } from '../actions/actions';
import {
    DispatchedEvent,
    WrappedDispatchedEvent,
    DispatchEventFactory,
    isValidEvent,
    eventIsPlainObject,
    isPromise,
    isDescriptor
} from '../internal/internals';

/**
 * @internal
 * @param target - Parent class that contains decorated property
 * @param key - Decorated key
 */
function dispatchEvent(target: any, key: string | symbol): DispatchEventFactory {
    const store = InjectorAccessor.getInjector().get<Store>(Store);

    return (event: DispatchedEvent): void => {
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
 * @param event - Wrapped dispatched event
 * @param dispatch - Function that dispatches event
 * @param zone - `NgZone` instance
 */
function dispatchEventInZone(event: WrappedDispatchedEvent, dispatch: DispatchEventFactory, zone: NgZone): void {
    const dispatchInsideZone = (event: DispatchedEvent) => zone.run(() => dispatch(event));

    zone.runOutsideAngular(() => {
        if (isObservable(event)) {
            event.pipe(first()).subscribe((event) => dispatchInsideZone(event));
        } else if (isPromise(event)) {
            event.then((event) => dispatchInsideZone(event));
        } else {
            dispatchInsideZone(event);
        }
    });
}

/**
 * @returns - A factory for decorating methods/properties
 */
export function Dispatch(): PropertyDecorator {
    return (target: any, key: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) => {
        let originalValue: Function = null!;

        function wrapped(...args: any[]) {
            const event: WrappedDispatchedEvent = originalValue.apply(target, args);
            const dispatch = dispatchEvent(target, key);
            const zone = InjectorAccessor.getInjector().get<NgZone>(NgZone);
            dispatchEventInZone(event, dispatch, zone);
        }

        if (isDescriptor(descriptor)) {
            originalValue = descriptor.value!;
            descriptor.value = wrapped;
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
