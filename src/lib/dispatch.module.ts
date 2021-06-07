import { NgModule, ModuleWithProviders, NgModuleRef } from '@angular/core';

import { setInjector } from './internals/static-injector';

@NgModule()
export class NgxsDispatchPluginModule {
  constructor(ngModuleRef: NgModuleRef<unknown>) {
    setInjector(ngModuleRef.injector);
    ngModuleRef.onDestroy(() => {
      setInjector(null);
    });
  }

  static forRoot(): ModuleWithProviders<NgxsDispatchPluginModule> {
    return {
      ngModule: NgxsDispatchPluginModule
    };
  }
}
