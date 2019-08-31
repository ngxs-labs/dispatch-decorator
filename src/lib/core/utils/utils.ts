import { DispatchAction } from '../actions/actions';
import { ObjectLiteralAction, DispatchedEvent } from '../internal/internals';

export function isMethodDecorator(
  descriptor?: any
): descriptor is TypedPropertyDescriptor<Function> {
  return descriptor && typeof descriptor.value === 'function';
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
      const action = new DispatchAction(event.payload);
      action.type = event.type;
      composed[i] = action;
    } else {
      composed[i] = event;
    }
  }

  return composed;
}

export function flatten<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
