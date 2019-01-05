import { NgZone } from '@angular/core';
import { Store } from '@ngxs/store';

import { isObservable, from } from 'rxjs';

import { InjectorAccessor } from '../services/injector-accessor.service';
import { DispatchedEvent, WrappedDispatchedEvent, DispatchEventFactory, StreamLike, DispatchedEventOrEvents } from '../internal/internals';
import { Utils } from '../utils/utils';

/**
 * Dispatches multiple events
 *
 * @param events - Array that contain plain objects or action instances
 * @param store - `Store` instance
 */
function dispatchMany(events: DispatchedEvent[], store: Store): void {
    const resolvedEvents = Utils.resolveEventsThatCanDiffer(events);
    store.dispatch(resolvedEvents);
}

/**
 * Dispatches single event
 *
 * @param event - Single dispatch event, can be object literal or action instance
 * @param store - `Store` instance
 */
function dispatchSingle(event: DispatchedEvent, store: Store): void {
    const resolvedEvent = Utils.resolveEventThatCanDiffer(event);
    store.dispatch(resolvedEvent);
}

/**
 * @internal
 * @param target - Parent class that contains decorated property
 * @param key - Decorated key
 */
function resolveDispatchEventFactory(): DispatchEventFactory {
    const store = InjectorAccessor.getInjector().get<Store>(Store);

    return (event: DispatchedEventOrEvents): void => {
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
    const dispatchInsideZone = (event: DispatchedEventOrEvents) => zone.run(() => dispatch(event));
    const isStreamOrPromise = isObservable<DispatchedEvent>(event) || Utils.isPromise(event);

    if (isStreamOrPromise) {
        from(event as StreamLike<DispatchedEventOrEvents>).subscribe((event) => {
            dispatchInsideZone(event);
        });
    } else {
        dispatchInsideZone(event as DispatchedEventOrEvents);
    }
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
            zone.runOutsideAngular(() => dispatchEvent(event, dispatch, zone));
        }

        if (Utils.isDescriptor(descriptor)) {
            originalValue = descriptor.value!;
            descriptor.value = wrapped;
        } else {
            Object.defineProperty(target, key, {
                set: (lambda: Function) => originalValue = lambda,
                get: () => wrapped
            });
        }
    };
}
