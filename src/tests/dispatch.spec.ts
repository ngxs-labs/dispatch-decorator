import { TestBed } from '@angular/core/testing';
import { Component, NgZone } from '@angular/core';
import { NgxsModule, State, Action, Store, StateContext, Actions, ofActionSuccessful } from '@ngxs/store';

import { of } from 'rxjs';
import { exhaustMap, delay, first, filter } from 'rxjs/operators';

import { NgxsDispatchPluginModule, Dispatch } from '../public_api';

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
        @Action(AddTodo)
        public addTodo({ setState, getState }: StateContext<Todo[]>, { payload }: AddTodo): void {
            setState([
                ...getState(),
                payload
            ]);
        }
    }

    it('should be possible to dispatch events using @Dispatch() decorator', () => {
        @Component({ template: '' })
        class MockComponent {
            @Dispatch()
            public addTodo = () => new AddTodo({
                text: 'Buy some coffee',
                completed: false
            })
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsDispatchPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const store: Store = TestBed.get(Store);
        const fixture = TestBed.createComponent(MockComponent);

        fixture.componentInstance.addTodo();

        const { length } = store.selectSnapshot<Todo[]>(({ todos }) => todos);
        expect(length).toBe(1);
    });

    it('should throw if the return type is not an object or doesn\'t have `type` property', () => {
        @Component({ template: '' })
        class MockComponent {
            @Dispatch()
            public addTodo = () => ({})
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsDispatchPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const fixture = TestBed.createComponent(MockComponent);

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
            })
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsDispatchPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const store: Store = TestBed.get(Store);
        const fixture = TestBed.createComponent(MockComponent);

        fixture.componentInstance.addTodo();

        const { length } = store.selectSnapshot<Todo[]>(({ todos }) => todos);
        expect(length).toBe(1);
    });

    it('should be possible to dispatch events if decorated method is marked with `async` keyword', () => {
        @Component({ template: '' })
        class MockComponent {
            @Dispatch()
            public addTodo = async () => new AddTodo({
                text: 'Buy some coffee',
                completed: false
            })
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsDispatchPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const store: Store = TestBed.get(Store);
        const actions$: Actions = TestBed.get(Actions);
        const fixture = TestBed.createComponent(MockComponent);

        actions$.pipe(
            ofActionSuccessful(AddTodo),
            exhaustMap(() => store.selectOnce<Todo[]>(({ todos }) => todos))
        ).subscribe(({ length }) => {
            expect(length).toBe(1);
        });

        fixture.componentInstance.addTodo();
    });

    it('should be possible to dispatch events if decorated method returns an `Observable`', (done: jest.DoneCallback) => {
        @Component({ template: '' })
        class MockComponent {
            @Dispatch()
            public addTodo = () => of(new AddTodo({
                text: 'Buy some coffee',
                completed: false
            })).pipe(delay(1000))
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsDispatchPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const store: Store = TestBed.get(Store);
        const actions$: Actions = TestBed.get(Actions);
        const fixture = TestBed.createComponent(MockComponent);

        actions$.pipe(
            ofActionSuccessful(AddTodo),
            exhaustMap(() => store.selectOnce<Todo[]>(({ todos }) => todos))
        ).subscribe(({ length }) => {
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
            }
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsDispatchPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const actions$: Actions = TestBed.get(Actions);
        const fixture = TestBed.createComponent(MockComponent);

        actions$.pipe(
            ofActionSuccessful(AddTodo),
            first()
        ).subscribe(() => {
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
            }
        }

        TestBed.configureTestingModule({
            imports: [
                NgxsModule.forRoot([TodosState]),
                NgxsDispatchPluginModule.forRoot()
            ],
            declarations: [
                MockComponent
            ]
        });

        const store: Store = TestBed.get(Store);
        const actions$: Actions = TestBed.get(Actions);
        const fixture = TestBed.createComponent(MockComponent);

        actions$.pipe(
            ofActionSuccessful(AddTodo),
            exhaustMap(() => store.selectOnce<Todo[]>(({ todos }) => todos)),
            filter(({ length }) => length === 2)
        ).subscribe(({ length }) => {
            expect(length).toBe(2);
            done();
        });

        fixture.componentInstance.addTodos();
    });
});
