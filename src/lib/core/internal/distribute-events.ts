import { NgZone, ɵisPromise as isPromise } from '@angular/core';
import { isObservable, Observable } from 'rxjs';

import { WrappedDispatchedEvent, DispatchedEventOrEvents, DispatchFactory } from './internals';

function unwrapObservable(
  result: Observable<DispatchedEventOrEvents>,
  dispatchWithinTheAngularZoneFactory: DispatchFactory
): Observable<DispatchedEventOrEvents> {
  result.subscribe({
    next: events => dispatchWithinTheAngularZoneFactory(events)
  });

  return result;
}

async function unwrapPromise(
  result: Promise<DispatchedEventOrEvents>,
  dispatchWithinTheAngularZoneFactory: DispatchFactory
): Promise<DispatchedEventOrEvents> {
  const events = await result;
  dispatchWithinTheAngularZoneFactory(events);
  return events;
}

export function distributeEvents(
  result: WrappedDispatchedEvent,
  dispatchFactory: DispatchFactory,
  zone: NgZone
) {
  function dispatchWithinTheAngularZoneFactory(events: DispatchedEventOrEvents) {
    zone.run(() => dispatchFactory(events));
  }

  if (isObservable(result)) {
    return unwrapObservable(result, dispatchWithinTheAngularZoneFactory);
  }

  if (isPromise(result)) {
    return unwrapPromise(result, dispatchWithinTheAngularZoneFactory);
  }

  dispatchWithinTheAngularZoneFactory(result);
  return result;
}
