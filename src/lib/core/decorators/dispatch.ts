import { ActionCompleter } from '../internals/action-completer';
import { getNgZone, getStore } from '../internals/static-injector';
import { distributeActions } from '../internals/distribute-actions';
import { flatten, renovateNgxsActions, isMethodDecorator } from '../utils/utils';
import { Wrapped, ActionOrActions, DispatchOptions } from '../internals/internals';

function dispatchFactory(actionOrActions: ActionOrActions): void {
  const store = getStore();
  const ngZone = getNgZone();
  const actions = flatten(actionOrActions);
  const renovated = renovateNgxsActions(actions);
  ngZone.run(() => store.dispatch(renovated));
}

export function Dispatch(
  options: DispatchOptions = { cancelUncompleted: false }
): PropertyDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor?: TypedPropertyDescriptor<Function>
  ) => {
    let originalValue: Function = null!;

    const actionCompleter = ActionCompleter.create(options.cancelUncompleted!);

    function wrapped(this: any) {
      // Every time the function is invoked we have to generate event
      // to cancel previously uncompleted asynchronous job
      if (actionCompleter !== null) {
        actionCompleter.cancelPreviousAction();
      }

      const ngZone = getNgZone();
      const wrapped: Wrapped = originalValue.apply(this, arguments);
      return ngZone.runOutsideAngular(() =>
        distributeActions(wrapped, actionCompleter, dispatchFactory)
      );
    }

    if (isMethodDecorator(descriptor)) {
      originalValue = descriptor.value!;
      descriptor.value = wrapped;
    } else {
      Object.defineProperty(target, propertyKey, {
        set: value => (originalValue = value),
        get: () => wrapped
      });
    }
  };
}
