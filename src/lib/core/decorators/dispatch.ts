import { DispatchOptions } from '../internals/internals';
import { getNgZone } from '../internals/static-injector';
import { ActionCompleter } from '../internals/action-completer';
import { distributeActions } from '../internals/distribute-actions';

function isMethodDecorator(descriptor?: any): descriptor is TypedPropertyDescriptor<Function> {
  return !!descriptor && typeof descriptor.value === 'function';
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
      const wrapped = originalValue.apply(this, arguments);
      return ngZone.runOutsideAngular(() => distributeActions(wrapped, actionCompleter));
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
