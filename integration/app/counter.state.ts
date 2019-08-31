import { State, Action, StateContext } from '@ngxs/store';

export interface CounterStateModel {
  counter: number;
}

export class Increment {
  static readonly type = '[Counter] Increment';
}

export class Decrement {
  static readonly type = '[Counter] Decrement';
}

@State<CounterStateModel>({
  name: 'counter',
  defaults: {
    counter: 0
  }
})
export class CounterState {
  @Action(Increment)
  increment(ctx: StateContext<CounterStateModel>) {
    const counter = ctx.getState().counter + 1;
    ctx.setState({ counter });
  }

  @Action(Decrement)
  decrement(ctx: StateContext<CounterStateModel>) {
    const counter = ctx.getState().counter - 1;
    ctx.setState({ counter });
  }
}
