import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsDispatchPluginModule } from '@ngxs-labs/dispatch-decorator';

import { CounterState } from './store';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'universal-dispatch-decorator' }),
    HttpClientModule,
    NgxsModule.forRoot([CounterState]),
    NgxsDispatchPluginModule.forRoot()
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
