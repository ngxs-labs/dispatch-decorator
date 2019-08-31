import { Store } from '@ngxs/store';

import { distributeActions } from '../internals/distribute-actions';
import { getNgZone, getStore, getActions$ } from '../internals/static-injector';
import { flatten, renovateNgxsActions, isMethodDecorator } from '../utils/utils';
import { Wrapped, ActionOrActions, Action, DispatchOptions } from '../internals/internals';

function dispatch(actionOrActions: ActionOrActions, store: Store): void {
  const actions: Action[] = flatten(actionOrActions);
  const renovated = renovateNgxsActions(actions);
  store.dispatch(renovated);
}

export function Dispatch(options: DispatchOptions = {}): PropertyDecorator {
  return (target: any, key: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) => {
    let originalValue: Function = null!;

    function wrapped(this: any) {
      const wrapped: Wrapped = originalValue.apply(this, arguments);
      const store = getStore();
      const ngZone = getNgZone();
      const actions$ = getActions$();
      const dispatchFactory = (actionOrActions: ActionOrActions) =>
        dispatch(actionOrActions, store);
      return ngZone.runOutsideAngular(() =>
        distributeActions(wrapped, dispatchFactory, ngZone, actions$, options)
      );
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
