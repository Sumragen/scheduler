import {NgModule} from '@angular/core';
import {GoogleApiModule, NG_GAPI_CONFIG, NgGapiClientConfig} from 'ng-gapi';
import {ScheduleComponent} from './schedule.component';
import {ScheduleService} from './schedule.service';
import {CommonModule} from '@angular/common';
import {DropdownModule, SliderModule} from 'primeng/primeng';
import {FileUploadModule} from 'primeng/primeng';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

const gapiClientConfig: NgGapiClientConfig = {
  client_id: 'CLIENT_ID',
  discoveryDocs: ['https://analyticsreporting.googleapis.com/$discovery/rest?version=v4'],
  scope: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/analytics'
  ].join(' ')
};

@NgModule({
  declarations: [
    ScheduleComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    DropdownModule,
    FileUploadModule,
    SliderModule,
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: gapiClientConfig
    }),
  ],
  exports: [
    ScheduleComponent,
  ],
  providers: [ScheduleService]
})
export class ScheduleModule {
}
