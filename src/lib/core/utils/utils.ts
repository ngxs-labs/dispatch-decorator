import { DispatchAction } from '../actions/actions';
import {
  DispatchedEventOrEvents,
  ObjectLiteralAction,
  DispatchedEvent
} from '../internal/internals';

export function isPromise(target: unknown): target is Promise<DispatchedEventOrEvents> {
  return target instanceof Promise;
}

export function isMethodDecorator(
  descriptor?: any
): descriptor is TypedPropertyDescriptor<Function> {
  return !!descriptor && descriptor.hasOwnProperty('value');
}

function eventIsPlainObject(event: any): event is ObjectLiteralAction {
  return event.constructor === Object;
}

export function composeEventsThatMayDiffer(events: DispatchedEvent[]): DispatchedEvent[] {
  const length = events.length;
  const composed = new Array(length);

  for (let i = 0; i < length; i++) {
    const event = events[i];

    if (eventIsPlainObject(event)) {
      DispatchAction.type = event.type;
      composed[i] = new DispatchAction(event.payload);
    } else {
      composed[i] = event;
    }
  }

  return composed;
}

export function flatten<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function isInteger(value: unknown): value is number {
  return typeof value === 'number';
}
