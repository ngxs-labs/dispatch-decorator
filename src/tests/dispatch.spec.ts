import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { NgxsModule, State, Action, Store, StateContext } from '@ngxs/store';

import { NgxsDispatchPluginModule, Dispatch } from '../public_api';

describe(NgxsDispatchPluginModule.name, () => {
    interface Todo {
        text: string;
        completed: boolean;
    }

    it('should be possible to dispatch events using @Dispatch() decorator', () => {
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
});
