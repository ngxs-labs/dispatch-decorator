import { Observable } from 'rxjs';

import { DispatchAction } from '../actions/actions';

/**
 * @property type - Dispatched event type
 * @property payload - Paylaod to dispatch
 */
export interface CustomAction<T = unknown> {
    type: string;
    new (payload?: T): any;
}

/**
 * @property type - Dispatched object literal type
 * @property payload - Dispatched object literal payload
 */
export interface ObjectLiteralAction<T = unknown> {
    type: string;
    payload?: T;
}

/**
 * Dispatched event alias
 */
export type DispatchedEvent<T = unknown> = CustomAction<T> | DispatchAction;

/**
 * An alias of asynchronous operation
 */
export type StreamLike<T> = Observable<T> | Promise<T>;

/**
 * The user can dispatch one event or multiple
 */
export type DispatchedEventOrEvents = DispatchedEvent | DispatchedEvent[];

/**
 * Methods decorated with `@Dispatch()` decorator can return plain object or `Promise` or `Observable`
 */
export type WrappedDispatchedEvent = StreamLike<DispatchedEventOrEvents> | DispatchedEventOrEvents;

/**
 * Factory function alias
 */
export type DispatchEventFactory = (event: DispatchedEventOrEvents) => void;
