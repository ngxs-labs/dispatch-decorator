import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';

import { Observable } from 'rxjs';

import { Increment, CounterState } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  @Select(CounterState.getCounter)
  public counter$: Observable<number>;

  constructor() {
    this.increment();
  }

  @Dispatch()
  private increment() {
    return new Increment();
  }
}
