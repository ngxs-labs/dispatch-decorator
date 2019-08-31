import { NgZone, ɵisPromise as isPromise } from '@angular/core';
import { isObservable, Observable } from 'rxjs';

import { Wrapped, ActionOrActions, DispatchFactory } from './internals';

function unwrapObservable(
  wrapped$: Observable<ActionOrActions>,
  dispatchWithinTheAngularZoneFactory: DispatchFactory
): Observable<ActionOrActions> {
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
  zone: NgZone
) {
  function dispatchWithinTheAngularZoneFactory(actionOrActions: ActionOrActions) {
    zone.run(() => dispatchFactory(actionOrActions));
  }

  if (isObservable(wrapped)) {
    return unwrapObservable(wrapped, dispatchWithinTheAngularZoneFactory);
  }

  if (isPromise(wrapped)) {
    return unwrapPromise(wrapped, dispatchWithinTheAngularZoneFactory);
  }

  dispatchWithinTheAngularZoneFactory(wrapped);
  return wrapped;
}
