import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Select } from '@ngxs/store';

import { Observable } from 'rxjs';

import { CounterState, CounterStateModel } from './counter.state';
import { CounterFacade } from './counter.facade';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  @Select(CounterState) counter$!: Observable<CounterStateModel>;

  constructor(private counterFacade: CounterFacade) {}

  increment(): void {
    this.counterFacade.increment();
  }

  decrement(): void {
    this.counterFacade.decrement();
  }
}
