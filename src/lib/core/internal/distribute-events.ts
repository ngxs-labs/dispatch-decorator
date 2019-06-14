import { NgZone } from '@angular/core';

import { isObservable, Observable } from 'rxjs';

import { isPromise } from '../utils/utils';
import { WrappedDispatchedEvent, DispatchedEventOrEvents, DispatchFactory } from './internals';

function unwrapObservable(
  events$: Observable<DispatchedEventOrEvents>,
  zonedDispatchFactory: DispatchFactory
): Observable<DispatchedEventOrEvents> {
  events$.subscribe((events) => {
    zonedDispatchFactory(events);
  });

  return events$;
}

async function unwrapPromise(
  promisedEvents: Promise<DispatchedEventOrEvents>,
  zonedDispatchFactory: DispatchFactory
): Promise<DispatchedEventOrEvents> {
  const events = await promisedEvents;
  zonedDispatchFactory(events);
  return events;
}

export function distributeEvents(
  event: WrappedDispatchedEvent,
  dispatchFactory: DispatchFactory,
  zone: NgZone
) {
  const zonedDispatchFactory = (events: DispatchedEventOrEvents) => {
    zone.run(() => dispatchFactory(events));
  };

  if (isObservable(event)) {
    return unwrapObservable(event, zonedDispatchFactory);
  }

  if (isPromise(event)) {
    return unwrapPromise(event, zonedDispatchFactory);
  }

  return zonedDispatchFactory(event);
}
