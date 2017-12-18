import { NgModule } from '@angular/core';
import { GoogleApiModule, NG_GAPI_CONFIG, NgGapiClientConfig } from 'ng-gapi';
import { ScheduleComponent } from './schedule.component';
import { ScheduleService } from './schedule.service';
import { CommonModule } from '@angular/common';
import { DropdownModule, SliderModule } from 'primeng/primeng';
import { FileUploadModule } from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { LessonListComponent } from './lesson-list/lesson-list.component';
import { LessonItemComponent } from './lesson-list/lesson-item/lesson-item.component';
import { SliderComponent } from './slider/slider.component';
import { StepsModule, MenuItem } from 'primeng/primeng';

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
    ScheduleComponent,
    LessonListComponent,
    LessonItemComponent,
    SliderComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    DropdownModule,
    FileUploadModule,
    SliderModule,
    HttpModule,
    StepsModule,
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
