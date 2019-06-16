import { State, Action, StateContext, Selector } from '@ngxs/store';

import { Increment } from './counter.actions';

export interface CounterStateModel {
  counter: number;
}

@State<CounterStateModel>({
  name: 'counter',
  defaults: {
    counter: 0
  }
})
export class CounterState {
  @Selector()
  public static getCounter(state: number): number {
    return state;
  }

  @Action(Increment)
  public increment({ setState, getState }: StateContext<CounterStateModel>) {
    const state = getState();
    state.counter += 1;
    setState({ ...state });
  }
}
