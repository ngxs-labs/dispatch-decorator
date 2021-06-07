import { Component, Injectable, NgModule, ɵivyEnabled } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';

import { Dispatch } from '..';

import { freshPlatform } from './fresh-platform';

describe('Parallel modules', () => {
  if (!ɵivyEnabled) {
    throw new Error('This test requires Ivy to be enabled.');
  }

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

  it(
    'should be possible to bootstrap modules in parallel like in server-side environment',
    freshPlatform(async () => {
      // Arrange & act
      @Injectable()
      class CounterFacade {
        @Dispatch() increment = () => new Increment();
      }

      @Component({ selector: 'app-root', template: '' })
      class TestComponent {}

      @NgModule({
        imports: [BrowserModule, NgxsModule.forRoot([CounterState], { developmentMode: true })],
        declarations: [TestComponent],
        bootstrap: [TestComponent],
        providers: [CounterFacade]
      })
      class TestModule {}

      const platform = platformBrowserDynamic();

      // Now let's bootstrap 2 different apps in parallel, this is basically the same what
      // Angular Universal does internally for concurrent HTTP requests.
      const [firstNgModuleRef, secondNgModuleRef] = await Promise.all([
        platform.bootstrapModule(TestModule),
        platform.bootstrapModule(TestModule)
      ]);

      const firstStore = firstNgModuleRef.injector.get(Store);
      const secondStore = secondNgModuleRef.injector.get(Store);

      const firstCounterFacade = firstNgModuleRef.injector.get(CounterFacade);
      const secondCounterFacade = secondNgModuleRef.injector.get(CounterFacade);

      firstCounterFacade.increment();
      firstCounterFacade.increment();

      // Assert
      expect(firstStore.selectSnapshot(CounterState)).toEqual(2);
      expect(secondStore.selectSnapshot(CounterState)).toEqual(0);

      secondCounterFacade.increment();
      secondCounterFacade.increment();
      secondCounterFacade.increment();

      expect(firstStore.selectSnapshot(CounterState)).toEqual(2);
      expect(secondStore.selectSnapshot(CounterState)).toEqual(3);

      firstNgModuleRef.destroy();

      secondCounterFacade.increment();

      expect(firstStore.selectSnapshot(CounterState)).toEqual(2);
      expect(secondStore.selectSnapshot(CounterState)).toEqual(4);
    })
  );
});
