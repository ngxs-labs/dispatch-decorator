import { Observable } from 'rxjs';

/**
 * @property type - Dispatched event type
 * @property payload - Paylaod to dispatch
 */
export interface DispatchedEvent<T = unknown> {
    type: string;
    payload?: T;
}

/**
 * Methods decorated with `@Dispatch()` decorator can return plain object or `Promise` or `Observable`
 */
export type WrappedDispatchedEvent = Observable<DispatchedEvent> | Promise<DispatchedEvent> | DispatchedEvent;

/**
 * Event can be a plain object or an instance of some class
 *
 * @internal
 * @param event - Dispatched event
 * @returns - True if plain object or instance constructor has `type` property
 */
export function hasTypeProperty<T extends Object>(event: T): boolean {
    return event.hasOwnProperty('type') || event.constructor.hasOwnProperty('type');
}

/**
 * @internal
 * @param event - Dispatched event
 * @returns - True if event is an object and has `type` property
 */
export function isValidEvent<T extends Object>(event: T): boolean {
    return !!event && typeof event === 'object' && hasTypeProperty<T>(event);
}

/**
 * Descriptor exists only in case of method decorating
 *
 * @internal
 * @param descriptor - Property descriptor
 * @returns - True if descriptor exists
 */
export function descriptorExists(descriptor: TypedPropertyDescriptor<Function> | undefined): boolean {
    return !!descriptor && descriptor.hasOwnProperty('value');
}

/**
 * @internal
 * @param event - Dispatched event
 * @returns - True if event is just a plain object without constructor
 */
export function eventIsPlainObject<T extends Object>(event: T): boolean {
    return event.constructor === Object;
}

/**
 * @param target - Target to check if it's a `Promise`
 * @returns - True if target is a `Promise`
 */
export function isPromise(target: any): target is Promise<unknown> {
    return target instanceof Promise;
}
