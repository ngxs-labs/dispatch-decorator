import { NgModule, ModuleWithProviders, Self } from '@angular/core';

import { StaticInjector } from './core/internal/static-injector';

@NgModule()
export class NgxsDispatchPluginModule {
  constructor(@Self() private staticInjector: StaticInjector) {}

  public static forRoot(): ModuleWithProviders<NgxsDispatchPluginModule> {
    return {
      ngModule: NgxsDispatchPluginModule,
      providers: [StaticInjector]
    };
  }
}
