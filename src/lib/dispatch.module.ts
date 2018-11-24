import { NgModule, ModuleWithProviders, Self } from '@angular/core';

import { InjectorAccessor } from './core/services/injector-accessor.service';

@NgModule()
export class NgxsDispatchPluginModule {
    constructor(@Self() private injectorAccessor: InjectorAccessor) {}

    /**
     * @returns - A wrapper around `NgModule`
     */
    public static forRoot(): ModuleWithProviders<NgxsDispatchPluginModule> {
        return {
            ngModule: NgxsDispatchPluginModule,
            providers: [InjectorAccessor]
        };
    }
}
