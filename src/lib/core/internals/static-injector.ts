import { Injector, NgZone } from '@angular/core';
import { Store } from '@ngxs/store';

class NgxsDispatchPluginModuleNotImported extends Error {
  message = 'NgxsDispatchPluginModule is not imported';
}

let injector: Injector | null = null;

function assertDefined<T>(actual: T | null | undefined): never | void {
  if (actual == null) {
    throw new NgxsDispatchPluginModuleNotImported();
  }
}

export function setInjector(parentInjector: Injector): void {
  injector = parentInjector;
}

export function getStore(): never | Store {
  assertDefined(injector);
  return injector!.get<Store>(Store);
}

export function getNgZone(): never | NgZone {
  assertDefined(injector);
  return injector!.get<NgZone>(NgZone);
}
