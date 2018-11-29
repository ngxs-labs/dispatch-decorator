import { DispatchedEventOrEvents, ObjectLiteralAction, DispatchedEvent } from '../internal/internals';
import { DispatchAction } from '../actions/actions';

/**
 * @internal
 */
export abstract class Utils {
    /**
     * @param target - Target to check if it's a `Promise`
     * @returns - True if target is a `Promise`
     */
    public static isPromise(target: any): target is Promise<DispatchedEventOrEvents> {
        return target instanceof Promise;
    }

    /**
     * Event can be a plain object or an instance of some class
     *
     * @internal
     * @param event - Dispatched event
     * @returns - True if plain object or instance constructor has `type` property
     */
    public static hasTypeProperty<T extends Object>(event: T): boolean {
        return event.hasOwnProperty('type') || event.constructor.hasOwnProperty('type');
    }

    /**
     * @internal
     * @param event - Dispatched event
     * @returns - True if event is an object and has `type` property
     */
    public static isValidEvent<T extends Object>(event: T): boolean {
        return !!event && typeof event === 'object' && this.hasTypeProperty<T>(event);
    }

    /**
     * Descriptor exists only in case of method decorating
     *
     * @internal
     * @param descriptor - Property descriptor
     * @returns - True if descriptor exists
     */
    public static isDescriptor(descriptor?: any): descriptor is TypedPropertyDescriptor<Function> {
        return !!descriptor && descriptor.hasOwnProperty('value');
    }

    /**
     * @internal
     * @param event - Dispatched event
     * @returns - True if event is just a plain object without constructor
     */
    public static eventIsPlainObject(event: any): event is ObjectLiteralAction {
        return event.constructor === Object;
    }

    /**
     * @param events - Events that differ from each other like custom event or object literal
     * @returns - Reduced events
     */
    public static resolveEventsThatCanDiffer(events: DispatchedEvent[]): DispatchedEvent[] {
        const resolvedEvents: DispatchedEvent[] = [];

        // Avoid `Array.prototype.reduce`
        for (let i = 0, length = events.length; i < length; i++) {
            const event = events[i];
            if (Utils.eventIsPlainObject(event)) {
                DispatchAction.type = event.type;
                resolvedEvents.push(new DispatchAction(event.payload));
            } else {
                resolvedEvents.push(event);
            }
        }

        return resolvedEvents;
    }

    /**
     * @param event - Event that can differ
     * @returns - Resolved event
     */
    public static resolveEventThatCanDiffer(event: DispatchedEvent): DispatchedEvent {
        if (this.eventIsPlainObject(event)) {
            DispatchAction.type = event.type;
            return new DispatchAction(event.payload);
        }

        return event;
    }
}
