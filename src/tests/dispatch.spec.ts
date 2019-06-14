import { TestBed } from '@angular/core/testing';
import { Component, NgZone, Type } from '@angular/core';
import {
  NgxsModule,
  State,
  Action,
  Store,
  StateContext,
  Actions,
  ofActionSuccessful,
  Selector
} from '@ngxs/store';

import { of, Observable, interval, timer, config, Subject } from 'rxjs';
import { delay, first, concatMapTo, map, mapTo, tap, finalize, take } from 'rxjs/operators';

import { NgxsDispatchPluginModule, Dispatch } from '../';

describe(NgxsDispatchPluginModule.name, () => {
  interface Todo {
    text: string;
    completed: boolean;
  }

  class AddTodo {
    public static readonly type = '[Todos] Add todo';
    constructor(public payload: Todo) {}
  }

  @State<Todo[]>({
    name: 'todos',
    defaults: []
  })
  class TodosState {
    @Selector()
    public static getTodos(state: Todo[]): Todo[] {
      return state;
    }

    @Action(AddTodo)
    public addTodo({ setState, getState }: StateContext<Todo[]>, { payload }: AddTodo): void {
      setState([...getState(), payload]);
    }
  }

  const configureTestingModule = <T>(component: Type<T>) => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TodosState]), NgxsDispatchPluginModule.forRoot()],
      declarations: [component]
    });

    const store: Store = TestBed.get<Store>(Store);
    const actions$: Actions = TestBed.get<Actions>(Actions);
    const fixture = TestBed.createComponent(component);

    return { store, actions$, fixture };
  };

  it('should be possible to dispatch events using @Dispatch() decorator', () => {
    @Component({ template: '' })
    class MockComponent {
      @Dispatch()
      public addTodo = () =>
        new AddTodo({
          text: 'Buy some coffee',
          completed: false
        });
    }

    const { store, fixture } = configureTestingModule(MockComponent);

    fixture.componentInstance.addTodo();

    const { length } = store.selectSnapshot(TodosState.getTodos);
    expect(length).toBe(1);
  });

  it('should throw if the return type is not an object or doesn`t have `type` property', () => {
    @Component({ template: '' })
    class MockComponent {
      @Dispatch()
      public addTodo = () => ({});
    }

    const { fixture } = configureTestingModule(MockComponent);

    try {
      fixture.componentInstance.addTodo();
    } catch ({ message }) {
      expect(message.indexOf('seems to return an invalid object')).toBeGreaterThan(-1);
    }
  });

  it('should be possible to dispatch plain objects using @Dispatch() decorator', () => {
    @Component({ template: '' })
    class MockComponent {
      @Dispatch()
      public addTodo = () => ({
        type: '[Todos] Add todo',
        payload: {
          text: 'Buy some coffee',
          completed: false
        }
      });
    }

    const { store, fixture } = configureTestingModule(MockComponent);

    fixture.componentInstance.addTodo();

    const { length } = store.selectSnapshot(TodosState.getTodos);
    expect(length).toBe(1);
  });

  it('should dispatch if method returns a `Promise`', () => {
    @Component({ template: '' })
    class MockComponent {
      @Dispatch()
      public addTodo = async () =>
        new AddTodo({
          text: 'Buy some coffee',
          completed: false
        });
    }

    const { store, actions$, fixture } = configureTestingModule(MockComponent);

    actions$
      .pipe(
        ofActionSuccessful(AddTodo),
        map(() => store.selectSnapshot(TodosState.getTodos)),
        first()
      )
      .subscribe((todos) => {
        expect(todos).toEqual([{ text: 'Buy some coffee', completed: false }]);
      });

    fixture.componentInstance.addTodo();
  });

  it('should dispatch if method returns an `Observable`', (done: jest.DoneCallback) => {
    @Component({ template: '' })
    class MockComponent {
      @Dispatch()
      public addTodo = () =>
        of(
          new AddTodo({
            text: 'Buy some coffee',
            completed: false
          })
        ).pipe(delay(1000));
    }

    const { store, actions$, fixture } = configureTestingModule(MockComponent);

    actions$
      .pipe(
        ofActionSuccessful(AddTodo),
        map(() => store.selectSnapshot(TodosState.getTodos))
      )
      .subscribe(({ length }) => {
        expect(length).toBe(1);
        done();
      });

    fixture.componentInstance.addTodo();
  });

  it('events should be handled outside zone but dispatched inside', (done: jest.DoneCallback) => {
    function asyncTimeout(timeout: number): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(resolve, timeout);
      });
    }

    @Component({ template: '' })
    class MockComponent {
      @Dispatch()
      public addTodo = async () => {
        await asyncTimeout(200);

        expect(NgZone.isInAngularZone()).toBeFalsy();

        await asyncTimeout(200);

        return new AddTodo({
          text: 'Buy some coffee',
          completed: false
        });
      };
    }

    const { actions$, fixture } = configureTestingModule(MockComponent);

    actions$
      .pipe(
        ofActionSuccessful(AddTodo),
        first()
      )
      .subscribe(() => {
        done();
      });

    fixture.componentInstance.addTodo();
  });

  it('should be possible to dispatch an array of events', (done: jest.DoneCallback) => {
    @Component({ template: '' })
    class MockComponent {
      @Dispatch()
      public addTodos = () => {
        const event = new AddTodo({
          text: 'Buy some coffee',
          completed: false
        });

        return [event, event];
      };
    }

    const { store, actions$, fixture } = configureTestingModule(MockComponent);

    actions$
      .pipe(
        ofActionSuccessful(AddTodo),
        map(() => store.selectSnapshot(TodosState.getTodos)),
        first(({ length }) => length === 2)
      )
      .subscribe((todos) => {
        expect(todos).toEqual([
          { text: 'Buy some coffee', completed: false },
          { text: 'Buy some coffee', completed: false }
        ]);

        done();
      });

    fixture.componentInstance.addTodos();
  });

  it('should be possible to use queue of events', (done: jest.DoneCallback) => {
    @Component({ template: '' })
    class MockComponent {
      @Dispatch()
      public addTodos(): Observable<AddTodo> {
        return of(null).pipe(
          concatMapTo([
            new AddTodo({
              text: 'Buy some coffee',
              completed: false
            }),

            new AddTodo({
              text: 'Buy some tea',
              completed: false
            })
          ])
        );
      }
    }

    const { store, actions$, fixture } = configureTestingModule(MockComponent);

    actions$
      .pipe(
        ofActionSuccessful(AddTodo),
        map(() => store.selectSnapshot(TodosState.getTodos)),
        first(({ length }) => length === 2)
      )
      .subscribe((todos) => {
        expect(todos).toEqual([
          { text: 'Buy some coffee', completed: false },
          { text: 'Buy some tea', completed: false }
        ]);

        done();
      });

    fixture.componentInstance.addTodos();
  });

  it('should be possible to access instance properties', (done: jest.DoneCallback) => {
    class MockBaseClass {
      private action = new AddTodo({
        text: 'Buy some coffee',
        completed: false
      });

      protected getAction() {
        return this.action;
      }
    }

    @Component({ template: '' })
    class MockComponent extends MockBaseClass {
      @Dispatch()
      public addTodo() {
        return this.getAction();
      }

      @Dispatch()
      public addTodoLambda = () => this.getAction();
    }

    const { store, actions$, fixture } = configureTestingModule(MockComponent);

    actions$
      .pipe(
        ofActionSuccessful(AddTodo),
        map(() => store.selectSnapshot(TodosState.getTodos)),
        first(({ length }) => length === 2)
      )
      .subscribe((todos) => {
        expect(todos).toEqual([
          { text: 'Buy some coffee', completed: false },
          { text: 'Buy some coffee', completed: false }
        ]);

        done();
      });

    fixture.componentInstance.addTodo();
    fixture.componentInstance.addTodoLambda();
  });
});
