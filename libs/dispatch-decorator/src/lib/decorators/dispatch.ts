import { NgZone } from '@angular/core';
import { Store } from '@ngxs/store';

import { DispatchOptions } from '../internals/internals';
import { getNgZone, getStore } from '../internals/static-injector';
import { distributeActions } from '../internals/distribute-actions';
import { createActionCompleter } from '../internals/action-completer';
import { ensureLocalInjectorCaptured, localInject } from '../internals/decorator-injector-adapter';

const defaultOptions: DispatchOptions = { cancelUncompleted: false };

export function Dispatch(options = defaultOptions): PropertyDecorator {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyKey: string | symbol,
    // eslint-disable-next-line @typescript-eslint/ban-types
    descriptor?: TypedPropertyDescriptor<Function>
  ) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    let originalValue: Function;

    const actionCompleter = createActionCompleter(options.cancelUncompleted!);

    function wrapped(this: ThisType<unknown>) {
      // Every time the function is invoked we have to generate event
      // to cancel previously uncompleted asynchronous job
      if (actionCompleter !== null) {
        actionCompleter.cancelPreviousAction();
      }

      const store = localInject(this, Store) || getStore();
      const ngZone = localInject(this, NgZone) || getNgZone();
      // eslint-disable-next-line prefer-rest-params
      const wrapped = originalValue.apply(this, arguments);

      return ngZone.runOutsideAngular(() =>
        distributeActions(store, ngZone, wrapped, actionCompleter)
      );
    }

    if (typeof descriptor?.value === 'function') {
      originalValue = descriptor.value!;
      descriptor.value = wrapped;
    } else {
      Object.defineProperty(target, propertyKey, {
        set: value => (originalValue = value),
        get: () => wrapped
      });
    }

    ensureLocalInjectorCaptured(target);
  };
}
