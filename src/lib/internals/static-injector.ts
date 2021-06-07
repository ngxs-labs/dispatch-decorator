import { Injector, NgZone } from '@angular/core';
import { Store } from '@ngxs/store';

class NgxsDispatchPluginModuleNotImported extends Error {
  message = 'NgxsDispatchPluginModule is not imported';
}

let _injector: Injector | null = null;

export function setInjector(injector: Injector | null): void {
  _injector = injector;
}

export function getStore(): never | Store {
  if (_injector === null) {
    throw new NgxsDispatchPluginModuleNotImported();
  } else {
    return _injector.get(Store);
  }
}

export function getNgZone(): never | NgZone {
  if (_injector === null) {
    throw new NgxsDispatchPluginModuleNotImported();
  } else {
    return _injector.get(NgZone);
  }
}
