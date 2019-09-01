import { Injectable } from '@angular/core';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';

import { timer } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import { Increment, Decrement } from '../counter.state';

@Injectable({ providedIn: 'root' })
export class CounterFacade {
  @Dispatch() increment = () => new Increment();

  @Dispatch() decrement = () => new Decrement();

  @Dispatch({ cancelUncompleted: true }) incrementAsync = () =>
    timer(500).pipe(mapTo(new Increment()));
}
