import { Injectable } from '@angular/core';
import { GoogleApiService } from 'ng-gapi';
import * as _ from 'lodash';
import { Http, ResponseContentType } from '@angular/http';
import * as moment from 'moment';
import { LoadingService } from '../loading/loading.service';

@Injectable()
export class GoogleService {
  teachers: object = {};
  dayOfWeek: number = (new Date().getDay() || 7) - 1;
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  private apiKey = 'AIzaSyB-uKx69GW0xHNqZ37MP3A3SFobvJjyp9E';
  private clientId = '1092343908105-l1nb3n0nup7a7jpdsqhkd69hhu5co7m0.apps.googleusercontent.com';
  private discoveryDocs = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
  private scope = 'https://www.googleapis.com/auth/spreadsheets.readonly';
  private spreadsheetId = '1bYCmLjh-g_5nDxCCayWwwuZNq3i35tsOQZeFWp5lmx8';
  private sheets: string[];
  private currentSheetName: string;
  private sheet: string[][];

  constructor(private gapiService: GoogleApiService, private http: Http, private loadingService: LoadingService) {
    this.loadingService.show();
    this.loadGapi();
  }

  loadGapi() {
    this.gapiService.onLoad()
      .subscribe(() => {
        this.initGapiClient();
      });
  }

  initGapiClient() {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: this.apiKey,
        clientId: this.clientId,
        discoveryDocs: this.discoveryDocs,
        scope: this.scope
      })
        .then(() => {
          this.readSheets().then(() => {
            this.currentSheetName = this.sheets[0];
          });
        });

    });
  }

  readSheets() {
    return (gapi.client as any).sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId
    }).then((response) => {
      this.sheets = _.map(response.result.sheets, (sheet: any) => sheet.properties.title);
      return this.sheets;
    });
  }

  loadSheet() {
    const range = this.currentSheetName + '!A13:CO167';
    return (gapi.client as any).sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: range,
    }).then((response) => {
      this.loadingService.hide();
      if (response && response.result && response.result.values) {
        return this.sheet = response.result.values;
      }
    });
  }

  isSheetLoaded(): boolean {
    return !!this.sheet && !!this.sheets;
  }

  isSheetsLoaded(): boolean {
    return !!this.sheets;
  }

  setSheet(sheetName: string) {
    this.currentSheetName = sheetName;
    return this.loadSheet();
  }

  getSheet(): string[][] {
    return this.sheet;
  }

  getSheets(): string[] {
    return this.sheets;
  }
}
