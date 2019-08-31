<p align="center">
    <img src="https://raw.githubusercontent.com/ngxs-labs/dispatch-decorator/master/docs/assets/logo.png">
</p>

---

> Reusable logic for avoiding `Store` injection

[![Build Status](https://travis-ci.org/ngxs-labs/dispatch-decorator.svg?branch=master)](https://travis-ci.org/ngxs-labs/dispatch-decorator)
[![NPM](https://badge.fury.io/js/%40ngxs-labs%2Fdispatch-decorator.svg)](https://www.npmjs.com/package/@ngxs-labs/dispatch-decorator)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/ngxs-labs/dispatch-decorator/blob/master/LICENSE)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/610c73ab99434bf9807c080e7feb8b85)](https://www.codacy.com/app/arturovt/dispatch-decorator?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ngxs-labs/dispatch-decorator&amp;utm_campaign=Badge_Grade)

This package simplifies dispatching process, you shouldn't care about `Store` service injection as we provide more declarative way to dispatch events out of the box.

## 📦 Install

To install `@ngxs-labs/dispatch-decorator` run the following command:

```console
npm install @ngxs-labs/dispatch-decorator
# or if you use yarn
yarn add @ngxs-labs/dispatch-decorator
```

## 🔨 Usage

Import the module into your root application module:

```typescript
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsDispatchPluginModule } from '@ngxs-labs/dispatch-decorator';

@NgModule({
  imports: [
    NgxsModule.forRoot(states),
    NgxsDispatchPluginModule.forRoot()
  ]
})
export class AppModule {}
```

### Dispatch Decorator

`@Dispatch()` is a function that allows you to decorate methods and properties of your classes. Firstly you have to create a state:

```typescript
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

Register this state in `NgxsModule` and import this state and actions into your component:

```typescript
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

Dispatchers can be also asynchronous. They can return either `Promise` or `Observable. Asynchronous operations are handled outside Angular's zone, thus it doesn't affect performance:

```typescript
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

Notice that it doesn't matter if you use an arrow function or a normal class method.

### Dispatching Multiple Actions

Dispatchers can return arrays. Actions will be handled synchronously one by one if their action handlers do synchronous job and vice versa if their handlers are asynchronous:

```typescript
export class AppComponent {
  @Dispatch() setLanguageAndNavigateHome = (language: string) => [
    new SetLanguage(language),
    new Navigate('/')
  ];
}
```
