import { DispatchAction } from '../actions/actions';
import { ObjectLiteralAction, Action } from '../internals/internals';

export function isMethodDecorator(
  descriptor?: any
): descriptor is TypedPropertyDescriptor<Function> {
  return descriptor && typeof descriptor.value === 'function';
}

function isPlainObject(target: any): target is ObjectLiteralAction {
  return target !== null && typeof target === 'object' && target.constructor === Object;
}

export function renovateNgxsActions(actions: Action[]): Action[] {
  const length = actions.length;
  const renovated = new Array<Action>(length);

  for (let i = 0; i < length; i++) {
    const action = actions[i];

    if (isPlainObject(action)) {
      const dispatchAction = new DispatchAction(action.payload);
      dispatchAction.type = action.type;
      renovated[i] = dispatchAction;
    } else {
      renovated[i] = action;
    }
  }

  return renovated;
}

export function flatten<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
