import { Store } from '@ngxs/store';

import { getNgZone, getStore } from '../internal/static-injector';
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

    function wrapped(this: any) {
      function dispatchFactory(events: DispatchedEventOrEvents) {
        return dispatch(events, store);
      }

      const event: WrappedDispatchedEvent = originalValue.apply(this, arguments);
      const ngZone = getNgZone();
      const store = getStore();

      return ngZone.runOutsideAngular(() => distributeEvents(event, dispatchFactory, ngZone));
    }

    if (isMethodDecorator(descriptor)) {
      originalValue = descriptor.value!;
      descriptor.value = wrapped;
    } else {
      Object.defineProperty(target, key, {
        set: value => (originalValue = value),
        get: () => wrapped
      });
    }
  };
}
