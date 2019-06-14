import { Store } from '@ngxs/store';

import { StaticInjector } from '../internal/static-injector';
import { distributeEvents } from '../internal/distribute-events';
import { flatten, composeEventsThatMayDiffer, isMethodDecorator } from '../utils/utils';
import { WrappedDispatchedEvent, DispatchedEventOrEvents } from '../internal/internals';

function dispatch(events: DispatchedEventOrEvents, store: Store): void {
  const flattened = flatten(events);
  const composed = composeEventsThatMayDiffer(flattened);
  store.dispatch(composed);
}

export function Dispatch(): PropertyDecorator {
  return (target: any, key: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) => {
    let originalValue: Function = null!;

    function wrapped(this: any, ...args: any[]) {
      const event: WrappedDispatchedEvent = originalValue.apply(this, args);
      const zone = StaticInjector.getZone();
      const store = StaticInjector.getStore();
      const dispatchFactory = (events: DispatchedEventOrEvents) => dispatch(events, store);

      return zone.runOutsideAngular(() => distributeEvents(event, dispatchFactory, zone));
    }

    if (isMethodDecorator(descriptor)) {
      originalValue = descriptor.value!;
      descriptor.value = wrapped;
    } else {
      Object.defineProperty(target, key, {
        set: (value: Function) => (originalValue = value),
        get: () => wrapped
      });
    }
  };
}
