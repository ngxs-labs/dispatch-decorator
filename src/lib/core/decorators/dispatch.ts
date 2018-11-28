import { NgZone } from '@angular/core';
import { Store } from '@ngxs/store';

import { isObservable, from } from 'rxjs';
import { first } from 'rxjs/operators';

import { InjectorAccessor } from '../services/injector-accessor.service';
import { DispatchAction } from '../actions/actions';
import {
    DispatchedEvent,
    WrappedDispatchedEvent,
    DispatchEventFactory,
    StreamLike,
    DispatchedEventOrDispatchedEvents,
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
function resolveDispatchEventFactory(target: any, key: string | symbol): DispatchEventFactory {
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
function dispatchEvent(event: WrappedDispatchedEvent, dispatch: DispatchEventFactory, zone: NgZone): void {
    const dispatchInsideZone = (event: DispatchedEventOrDispatchedEvents) => {
        if (Array.isArray(event)) {
            zone.run(() => {
                for (let i = 0, length = event.length; i < length; i++) {
                    dispatch(event[i]);
                }
            });
        } else {
            zone.run(() => dispatch(event));
        }
    };

    zone.runOutsideAngular(() => {
        const isStreamOrPromise = isObservable<DispatchedEvent>(event) || isPromise(event);

        if (isStreamOrPromise) {
            from(event as StreamLike<DispatchedEventOrDispatchedEvents>).pipe(first()).subscribe((event) => {
                dispatchInsideZone(event);
            });
        } else {
            dispatchInsideZone(event as DispatchedEventOrDispatchedEvents);
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
            const dispatch = resolveDispatchEventFactory(target, key);
            const zone = InjectorAccessor.getInjector().get<NgZone>(NgZone);
            dispatchEvent(event, dispatch, zone);
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
