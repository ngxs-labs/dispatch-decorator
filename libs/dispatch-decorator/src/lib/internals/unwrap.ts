import { ɵisPromise } from '@angular/core';
import { Store } from '@ngxs/store';
import { isObservable, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActionCompleter } from './action-completer';
import { Wrapped, ActionOrActions } from './internals';

function unwrapObservable(
  store: Store,
  wrapped: Observable<ActionOrActions>,
  actionCompleter: ActionCompleter | null
): Observable<ActionOrActions> {
  if (actionCompleter !== null) {
    wrapped = wrapped.pipe(takeUntil(actionCompleter.cancelUncompleted$));
  }

  wrapped.subscribe({
    next: actionOrActions => store.dispatch(actionOrActions)
  });

  return wrapped;
}

function unwrapPromise(store: Store, wrapped: Promise<ActionOrActions>): Promise<ActionOrActions> {
  return wrapped.then(actionOrActions => {
    store.dispatch(actionOrActions);
    return actionOrActions;
  });
}

export function unwrapAndDispatch(
  store: Store,
  wrapped: Wrapped,
  actionCompleter: ActionCompleter | null
) {
  if (ɵisPromise(wrapped)) {
    return unwrapPromise(store, wrapped);
  } else if (isObservable(wrapped)) {
    return unwrapObservable(store, wrapped, actionCompleter);
  } else {
    store.dispatch(wrapped);
    return wrapped;
  }
}
