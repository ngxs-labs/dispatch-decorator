import { NgModule, ModuleWithProviders, Injector } from '@angular/core';

import { setInjector } from './core/internal/static-injector';

@NgModule()
export class NgxsDispatchPluginModule {
  constructor(injector: Injector) {
    setInjector(injector);
  }

  static forRoot(): ModuleWithProviders<NgxsDispatchPluginModule> {
    return {
      ngModule: NgxsDispatchPluginModule
    };
  }
}
