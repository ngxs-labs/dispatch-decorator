import { ɵisPromise as isPromise } from '@angular/core';
import { isObservable, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActionCompleter } from './action-completer';
import { Wrapped, ActionOrActions } from './internals';
import { getStore, getNgZone } from './static-injector';

function dispatchFactory(actionOrActions: ActionOrActions): void {
  const store = getStore();
  const ngZone = getNgZone();
  ngZone.run(() => store.dispatch(actionOrActions));
}

function unwrapObservable(
  wrapped: Observable<ActionOrActions>,
  actionCompleter: ActionCompleter | null
): Observable<ActionOrActions> {
  // If it is not nully then it means `cancelUncompleted` is truthy
  if (actionCompleter !== null) {
    wrapped = wrapped.pipe(takeUntil(actionCompleter.cancelUncompleted$));
  }

  wrapped.subscribe({
    next: actionOrActions => dispatchFactory(actionOrActions)
  });

  return wrapped;
}

async function unwrapPromise(wrapped: Promise<ActionOrActions>): Promise<ActionOrActions> {
  const actionOrActions = await wrapped;
  dispatchFactory(actionOrActions);
  return actionOrActions;
}

/**
 * As dispatchers can have different return types, they can be either
 * synchronous or asynchronous, we have to determine its return type
 * and unwrap `Promise` or `Observable`
 */
export function distributeActions(wrapped: Wrapped, actionCompleter: ActionCompleter | null) {
  if (isObservable(wrapped)) {
    return unwrapObservable(wrapped, actionCompleter);
  }

  if (isPromise(wrapped)) {
    return unwrapPromise(wrapped);
  }

  dispatchFactory(wrapped);
  return wrapped;
}
