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
    eventIsPlainObject,
    isPromise,
    isDescriptor
} from '../internal/internals';

/**
 * Dispatches multiple events
 *
 * @param events - Array that contain plain objects or action instances
 * @param store - `Store` instance
 */
function dispatchMany(events: DispatchedEvent[], store: Store): void {
    events = events.reduce((accumulator: any[], event) => {
        if (eventIsPlainObject(event)) {
            DispatchAction.type = event.type;
            accumulator.push(new DispatchAction(event.payload));
        } else {
            accumulator.push(event);
        }

        return accumulator;
    }, []);

    store.dispatch(events);
}

/**
 * Dispatches single event
 *
 * @param event - Single dispatch event, can be object literal or action instance
 * @param store - `Store` instance
 */
function dispatchSingle(event: DispatchedEvent, store: Store): void {
    if (eventIsPlainObject(event)) {
        DispatchAction.type = event.type;
        store.dispatch(new DispatchAction(event.payload));
    } else {
        store.dispatch(event);
    }
}

/**
 * @internal
 * @param target - Parent class that contains decorated property
 * @param key - Decorated key
 */
function resolveDispatchEventFactory(): DispatchEventFactory {
    const store = InjectorAccessor.getInjector().get<Store>(Store);

    return (event: DispatchedEventOrDispatchedEvents): void => {
        if (Array.isArray(event)) {
            dispatchMany(event, store);
        } else {
            dispatchSingle(event, store);
        }
    };
}

/**
 * @param event - Wrapped dispatched event
 * @param dispatch - Function that dispatches event
 * @param zone - `NgZone` instance
 */
function dispatchEvent(event: WrappedDispatchedEvent, dispatch: DispatchEventFactory, zone: NgZone): void {
    const dispatchInsideZone = (event: DispatchedEventOrDispatchedEvents) => zone.run(() => dispatch(event));

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
            const dispatch = resolveDispatchEventFactory();
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
