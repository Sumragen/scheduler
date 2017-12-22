import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ScheduleModule } from './schedule/schedule.module';
import { GoogleApiModule, NG_GAPI_CONFIG, NgGapiClientConfig } from 'ng-gapi';
import { GoogleService } from './share/google/google.service';

const gapiClientConfig: NgGapiClientConfig = {
  client_id: '1092343908105-l1nb3n0nup7a7jpdsqhkd69hhu5co7m0.apps.googleusercontent.com',
  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  scope: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/spreadsheets.values.get'
  ].join(' ')
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ScheduleModule,
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: gapiClientConfig
    })
  ],
  providers: [
    GoogleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
