import { ɵisPromise as isPromise } from '@angular/core';
import { isObservable, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActionCompleter } from './action-completer';
import { Wrapped, ActionOrActions, DispatchFactory } from './internals';

function unwrapObservable(
  wrapped$: Observable<ActionOrActions>,
  actionCompleter: ActionCompleter | null,
  dispatchWithinTheAngularZoneFactory: DispatchFactory
): Observable<ActionOrActions> {
  // If it is not nully then it means `cancelUncompleted` is truthy
  if (actionCompleter) {
    wrapped$ = wrapped$.pipe(takeUntil(actionCompleter.cancelUncompleted$));
  }

  wrapped$.subscribe({
    next: actionOrActions => dispatchWithinTheAngularZoneFactory(actionOrActions)
  });

  return wrapped$;
}

async function unwrapPromise(
  wrapped: Promise<ActionOrActions>,
  dispatchWithinTheAngularZoneFactory: DispatchFactory
): Promise<ActionOrActions> {
  const actionOrActions = await wrapped;
  dispatchWithinTheAngularZoneFactory(actionOrActions);
  return actionOrActions;
}

/**
 * As dispatchers can have different return types, they can be either
 * synchronous or asynchronous, we have to determine its return type
 * and unwrap `Promise` or `Observable`
 */
export function distributeActions(
  wrapped: Wrapped,
  actionCompleter: ActionCompleter | null,
  dispatchFactory: DispatchFactory
) {
  if (isObservable(wrapped)) {
    return unwrapObservable(wrapped, actionCompleter, dispatchFactory);
  }

  if (isPromise(wrapped)) {
    return unwrapPromise(wrapped, dispatchFactory);
  }

  dispatchFactory(wrapped);
  return wrapped;
}
