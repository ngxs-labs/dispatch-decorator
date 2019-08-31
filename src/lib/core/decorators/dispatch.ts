import { Store } from '@ngxs/store';

import { getNgZone, getStore } from '../internals/static-injector';
import { distributeActions } from '../internals/distribute-actions';
import { Wrapped, ActionOrActions, Action } from '../internals/internals';
import { flatten, renovateNgxsActions, isMethodDecorator } from '../utils/utils';

function dispatch(actionOrActions: ActionOrActions, store: Store): void {
  const actions: Action[] = flatten(actionOrActions);
  const renovated = renovateNgxsActions(actions);
  store.dispatch(renovated);
}

export function Dispatch(): PropertyDecorator {
  return (target: any, key: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) => {
    let originalValue: Function = null!;

    function wrapped(this: any) {
      const wrapped: Wrapped = originalValue.apply(this, arguments);
      const store = getStore();
      const ngZone = getNgZone();
      const dispatchFactory = (actionOrActions: ActionOrActions) =>
        dispatch(actionOrActions, store);
      return ngZone.runOutsideAngular(() => distributeActions(wrapped, dispatchFactory, ngZone));
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
