import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../schedule.service';
import { MenuItem } from 'primeng/primeng';
import * as _ from 'lodash';
import GoogleUser = gapi.auth2.GoogleUser;
import { GoogleApiService, GoogleAuthService } from 'ng-gapi';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements OnInit {
  selectedDay: number;

  daysOfWeek: MenuItem;

  constructor(private scheduleService: ScheduleService) {
  }

  ngOnInit() {
    this.selectedDay = this.scheduleService.dayOfWeek;
    this.daysOfWeek = _.map(this.scheduleService.days, (day: string) => {
      return {label: day};
    });
  }

  selectDay(day: number) {
    this.selectedDay = day;
    this.scheduleService.setDayOfWeek(day);
  }
}
