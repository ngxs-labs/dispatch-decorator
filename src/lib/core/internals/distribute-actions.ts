import { NgZone, ɵisPromise as isPromise } from '@angular/core';
import { ofActionDispatched, Actions } from '@ngxs/store';
import { isObservable, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Wrapped, ActionOrActions, DispatchFactory, DispatchOptions } from './internals';

function unwrapObservable(
  wrapped$: Observable<ActionOrActions>,
  dispatchWithinTheAngularZoneFactory: DispatchFactory,
  actions$: Actions,
  options: DispatchOptions
): Observable<ActionOrActions> {
  if (options.cancelableBy) {
    wrapped$ = wrapped$.pipe(takeUntil(actions$.pipe(ofActionDispatched(options.cancelableBy))));
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

export function distributeActions(
  wrapped: Wrapped,
  dispatchFactory: DispatchFactory,
  zone: NgZone,
  actions$: Actions,
  options: DispatchOptions
) {
  function dispatchWithinTheAngularZoneFactory(actionOrActions: ActionOrActions) {
    zone.run(() => dispatchFactory(actionOrActions));
  }

  if (isObservable(wrapped)) {
    return unwrapObservable(wrapped, dispatchWithinTheAngularZoneFactory, actions$, options);
  }

  if (isPromise(wrapped)) {
    return unwrapPromise(wrapped, dispatchWithinTheAngularZoneFactory);
  }

  dispatchWithinTheAngularZoneFactory(wrapped);
  return wrapped;
}
