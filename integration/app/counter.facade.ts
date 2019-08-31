import { Injectable } from '@angular/core';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';

import { Increment, Decrement } from './counter.state';

@Injectable({ providedIn: 'root' })
export class CounterFacade {
  @Dispatch() increment = () => new Increment();

  @Dispatch() decrement = () => new Decrement();
}
