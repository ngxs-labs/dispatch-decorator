import { NgZone, ɵisPromise } from '@angular/core';
import { Store } from '@ngxs/store';
import { isObservable, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActionCompleter } from './action-completer';
import { Wrapped, ActionOrActions } from './internals';

function dispatch(store: Store, ngZone: NgZone, actionOrActions: ActionOrActions): void {
  ngZone.run(() => store.dispatch(actionOrActions));
}

function unwrapObservable(
  store: Store,
  ngZone: NgZone,
  wrapped: Observable<ActionOrActions>,
  actionCompleter: ActionCompleter | null
): Observable<ActionOrActions> {
  if (actionCompleter !== null) {
    wrapped = wrapped.pipe(takeUntil(actionCompleter.cancelUncompleted$));
  }

  wrapped.subscribe({
    next: actionOrActions => dispatch(store, ngZone, actionOrActions)
  });

  return wrapped;
}

function unwrapPromise(
  store: Store,
  ngZone: NgZone,
  wrapped: Promise<ActionOrActions>
): Promise<ActionOrActions> {
  return wrapped.then(actionOrActions => {
    dispatch(store, ngZone, actionOrActions);
    return actionOrActions;
  });
}

/**
 * As dispatchers can have different return types, they can be either
 * synchronous or asynchronous, we have to determine its return type
 * and unwrap `Promise` or `Observable`
 */
export function distributeActions(
  store: Store,
  ngZone: NgZone,
  wrapped: Wrapped,
  actionCompleter: ActionCompleter | null
) {
  if (ɵisPromise(wrapped)) {
    return unwrapPromise(store, ngZone, wrapped);
  } else if (isObservable(wrapped)) {
    return unwrapObservable(store, ngZone, wrapped, actionCompleter);
  } else {
    dispatch(store, ngZone, wrapped);
    return wrapped;
  }
}
