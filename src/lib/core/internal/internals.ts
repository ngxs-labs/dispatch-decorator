import { Observable } from 'rxjs';

import { DispatchAction } from '../actions/actions';

export type CustomAction<T = unknown> = new (payload?: T) => any;

export interface ObjectLiteralAction<T = unknown> {
  type: string;
  payload?: T;
}

export type DispatchedEvent<T = unknown> = CustomAction<T> | DispatchAction;

export type StreamLike<T> = Observable<T> | Promise<T>;

export type DispatchFactory = (events: DispatchedEventOrEvents) => void;

export type DispatchedEventOrEvents = DispatchedEvent | DispatchedEvent[];

export type WrappedDispatchedEvent = StreamLike<DispatchedEventOrEvents> | DispatchedEventOrEvents;

export type DispatchEventFactory = (event: DispatchedEventOrEvents) => void;
