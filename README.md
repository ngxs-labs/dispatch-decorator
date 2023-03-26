<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

> The distribution for separation of concern between the state management and the view

[![NPM](https://badge.fury.io/js/%40ngxs-labs%2Fdispatch-decorator.svg)](https://www.npmjs.com/package/@ngxs-labs/dispatch-decorator)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/ngxs-labs/dispatch-decorator/blob/master/LICENSE)

This package simplifies the dispatching process. It would be best if you didn't care about the `Store` service injection, as we provide a more declarative way to dispatch events out of the box.

## Compatibility with Angular Versions

<table>
  <thead>
    <tr>
      <th>@ngxs-labs/dispatch-decorator</th>
      <th>Angular</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        4.x
      </td>
      <td>
        >= 13 < 15
      </td>
    </tr>
    <tr>
      <td>
        5.x
      </td>
      <td>
        >= 15
      </td>
    </tr>
  </tbody>
</table>

## 📦 Install

To install the `@ngxs-labs/dispatch-decorator`, run the following command:

```sh
$ npm install @ngxs-labs/dispatch-decorator
# Or if you're using yarn
$ yarn add @ngxs-labs/dispatch-decorator
# Or if you're using pnpm
$ pnpm install @ngxs-labs/dispatch-decorator
```

## 🔨 Usage

Import the module into your root application module:

```ts
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsDispatchPluginModule } from '@ngxs-labs/dispatch-decorator';

@NgModule({
  imports: [NgxsModule.forRoot(states), NgxsDispatchPluginModule.forRoot()]
})
export class AppModule {}
```

### Dispatch Decorator

`@Dispatch()` can be used to decorate methods and properties of your classes. Firstly let's create our state for demonstrating purposes:

```ts
import { State, Action, StateContext } from '@ngxs/store';

export class Increment {
  static readonly type = '[Counter] Increment';
}

export class Decrement {
  static readonly type = '[Counter] Decrement';
}

@State<number>({
  name: 'counter',
  defaults: 0
})
export class CounterState {
  @Action(Increment)
  increment(ctx: StateContext<number>) {
    ctx.setState(ctx.getState() + 1);
  }

  @Action(Decrement)
  decrement(ctx: StateContext<number>) {
    ctx.setState(ctx.getState() - 1);
  }
}
```

We are ready to try the plugin after registering our state in the `NgxsModule`, given the following component:

```ts
import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';

import { Observable } from 'rxjs';

import { CounterState, Increment, Decrement } from './counter.state';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="counter$ | async as counter">
      <h1>{{ counter }}</h1>
    </ng-container>

    <button (click)="increment()">Increment</button>
    <button (click)="decrement()">Decrement</button>
  `
})
export class AppComponent {
  @Select(CounterState) counter$: Observable<number>;

  @Dispatch() increment = () => new Increment();

  @Dispatch() decrement = () => new Decrement();
}
```

You may mention that we don't have to inject the `Store` class to dispatch actions. The `@Dispatch` decorator takes care of delivering actions internally. It unwraps the result of function calls and calls `store.dispatch(...)`.

Dispatch function can be both synchronous and asynchronous, meaning that the `@Dispatch` decorator can unwrap `Promise` and `Observable`. Dispatch functions are called outside of the Angular zone, which means asynchronous tasks won't notify Angular about change detection forced to be run:

```ts
export class AppComponent {
  // `ApiService` is defined somewhere
  constructor(private api: ApiService) {}

  @Dispatch()
  async setAppSchema() {
    const version = await this.api.getApiVersion();
    const schema = await this.api.getSchemaForVersion(version);
    return new SetAppSchema(schema);
  }

  // OR using lambda

  @Dispatch() setAppSchema = () =>
    this.api.getApiVersion().pipe(
      mergeMap(version => this.api.getSchemaForVersion(version)),
      map(schema => new SetAppSchema(schema))
    );
}
```

Note it doesn't if an arrow function or a regular class method is used.

### Dispatching Multiple Actions

`@Dispatch` function can return arrays of actions:

```ts
export class AppComponent {
  @Dispatch() setLanguageAndNavigateHome = (language: string) => [
    new SetLanguage(language),
    new Navigate('/')
  ];
}
```

### Canceling

`@Dispatch` functions can cancel currently running actions if they're called again in the middle of running actions. This is useful for canceling previous requests like in a typeahead. Given the following example:

```ts
@Component({ ... })
export class NovelsComponent {
  @Dispatch() searchNovels = (query: string) =>
    this.novelsService.getNovels(query).pipe(map(novels => new SetNovels(novels)));

  constructor(private novelsService: NovelsService) {}
}
```

We have to provide the `cancelUncompleted` option if we'd want to cancel previously uncompleted `getNovels` action:

```ts
@Component({ ... })
export class NovelsComponent {
  @Dispatch({ cancelUncompleted: true }) searchNovels = (query: string) =>
    this.novelsService.getNovels(query).pipe(map(novels => new SetNovels(novels)));

  constructor(private novelsService: NovelsService) {}
}
```
