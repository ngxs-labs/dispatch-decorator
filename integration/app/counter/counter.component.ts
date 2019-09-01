import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Select } from '@ngxs/store';

import { Observable } from 'rxjs';

import { CounterFacade } from './counter.facade';
import { CounterState, CounterStateModel } from '../counter.state';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {
  @Select(CounterState) counter$!: Observable<CounterStateModel>;

  constructor(private counterFacade: CounterFacade) {}

  increment(): void {
    this.counterFacade.increment();
  }

  decrement(): void {
    this.counterFacade.decrement();
  }

  incrementAsync(): void {
    this.counterFacade.incrementAsync();
  }
}
