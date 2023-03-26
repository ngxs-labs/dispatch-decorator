/// <reference types="jest" />

import { TestBed } from '@angular/core/testing';
import { Injectable, NgZone } from '@angular/core';
import { NgxsModule, State, Action, Store, StateContext } from '@ngxs/store';

import { of, timer } from 'rxjs';
import { delay, concatMapTo, mapTo } from 'rxjs/operators';

import { Dispatch } from '../decorators/dispatch';
import { NgxsDispatchPluginModule } from '../dispatch.module';

describe(NgxsDispatchPluginModule.name, () => {
  class Increment {
    static readonly type = '[Counter] Increment';
  }

  class Decrement {
    static readonly type = '[Counter] Decrement';
  }

  @State({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Action(Increment)
    increment(ctx: StateContext<number>) {
      ctx.setState(state => state + 1);
    }

    @Action(Decrement)
    decrement(ctx: StateContext<number>) {
      ctx.setState(state => state - 1);
    }
  }

  it('should be possible to dispatch events using @Dispatch() decorator', () => {
    // Arrange
    class CounterFacade {
      @Dispatch() increment = () => new Increment();
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    facade.increment();

    const counter: number = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(1);
  });

  it('should be possible to dispatch plain objects using @Dispatch() decorator', () => {
    // Arrange
    class CounterFacade {
      @Dispatch() increment = () => ({
        type: '[Counter] Increment'
      });
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    facade.increment();

    const counter: number = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(1);
  });

  it('should dispatch if method returns a `Promise`', async () => {
    // Arrange
    class CounterFacade {
      @Dispatch() incrementAsync = () => Promise.resolve(new Increment());
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    await facade.incrementAsync();

    const counter: number = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(1);
  });

  it('should dispatch if method returns an `Observable`', async () => {
    // Arrange
    class CounterFacade {
      @Dispatch() incrementAsync = () => of(new Increment()).pipe(delay(1000));
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    await facade.incrementAsync().toPromise();

    const counter: number = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(1);
  });

  it('events should be handled outside of Angular zone but dispatched within', async () => {
    // Arrange
    function delay(timeout: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, timeout));
    }

    class CounterFacade {
      @Dispatch() incrementAsync = async () => {
        await delay(200);
        expect(NgZone.isInAngularZone()).toBeFalsy();
        await delay(200);
        return new Increment();
      };
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    await facade.incrementAsync();

    const counter: number = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(1);
  });

  it('should be possible to dispatch an array of events', () => {
    // Arrange
    class CounterFacade {
      @Dispatch() increment = () => [new Increment(), new Increment()];
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    facade.increment();

    const counter: number = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(2);
  });

  it('should be possible to use queue of events', () => {
    // Arrange
    class CounterFacade {
      @Dispatch() increment = () => of(null).pipe(concatMapTo([new Increment(), new Increment()]));
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    facade.increment();

    const counter: number = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(2);
  });

  it('should be possible to access instance properties', () => {
    // Arrange
    abstract class BaseCounterFacade {
      private action = new Increment();

      protected getAction() {
        return this.action;
      }
    }

    class CounterFacade extends BaseCounterFacade {
      @Dispatch() increment() {
        return this.getAction();
      }

      @Dispatch() incrementLambda = () => this.getAction();
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    facade.increment();
    facade.incrementLambda();

    const counter: number = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(2);
  });

  it('should not dispatch multiple times if subscribed underneath and directly', async () => {
    // Arrange
    class CounterFacade {
      @Dispatch() incrementAsync = () => timer(0).pipe(mapTo(new Increment()));
      @Dispatch() decrementAsync = () => timer(0).pipe(mapTo(new Decrement()));
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    // `toPromise` causes to `subscribe` under the hood
    await facade.incrementAsync().toPromise();
    await facade.decrementAsync().toPromise();

    const counter = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(0);
  });

  it('should cancel previously uncompleted asynchronous operations', async () => {
    // Arrange
    class CounterFacade {
      @Dispatch({ cancelUncompleted: true }) increment = () =>
        timer(500).pipe(mapTo(new Increment()));
    }

    // Act
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CounterState], { developmentMode: true }),
        NgxsDispatchPluginModule.forRoot()
      ]
    });

    const facade = new CounterFacade();
    const store: Store = TestBed.inject(Store);

    facade.increment();
    facade.increment();
    await facade.increment().toPromise();

    const counter = store.selectSnapshot(CounterState);
    // Assert
    expect(counter).toBe(1);
  });
});
