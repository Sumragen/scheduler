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

  public static SESSION_STORAGE_KEY = 'accessToken';

  private user: GoogleUser;

  selectedDay: number;

  daysOfWeek: MenuItem;

  constructor(private scheduleService: ScheduleService,
              private googleAuth: GoogleAuthService,
              private gapiService: GoogleApiService,
              private httpClient: HttpClient) {
  }

  ngOnInit() {
    this.selectedDay = this.scheduleService.dayOfWeek;
    this.daysOfWeek = _.map(this.scheduleService.days, (day: string) => {
      return {label: day};
    });

    /*this.gapiService.onLoad().subscribe(() => {
      const gapis: any = gapi;
      console.log(gapis);
      /!*gapis.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
      }).then(function (response) {
        console.log('done', response);
      }, function (response) {
        console.log('error', response);
      });*!/
    });*/
  }

  selectDay(day: number) {
    this.selectedDay = day;
    this.scheduleService.setDayOfWeek(day);
    const id = '1bYCmLjh-g_5nDxCCayWwwuZNq3i35tsOQZeFWp5lmx8';
    const s = 'https://spreadsheets.google.com/feeds/list/' + id + '/1/public/values?alt=json';
    const url = 'https://spreadsheets.google.com/feeds/list/' + id + '/od6/public/values?alt=json';
    console.log('gapi', gapi);
    this.httpClient.get(s)
      .subscribe((data: any) => {
        console.log('Raw Data', data);
      });

    // this.googleAuth.getAuth()
    //   .subscribe((auth) => {
    //     auth.signIn().then(res => this.signInSuccessHandler(res));
    //   });
  }

  private signInSuccessHandler(res: GoogleUser) {
    this.user = res;
    console.log(res);
    sessionStorage.setItem(
      'accessToken', res.getAuthResponse().access_token
    );
  }
}
