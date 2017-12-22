import { Injectable } from '@angular/core';
import { GoogleApiService } from 'ng-gapi';
import * as _ from 'lodash';
import { Http, ResponseContentType } from '@angular/http';
import * as moment from 'moment';

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
  private currentSheetName = 'Л.Т. Б 17-18';
  private sheet: string[][];

  constructor(private gapiService: GoogleApiService, private http: Http) {
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
          this.readSheets();
          this.loadSheet();
        });

    });
  }

  readSheets() {
    (gapi.client as any).sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId
    }).then((response) => {
      this.sheets = _.map(response.result.sheets, (sheet: any) => sheet.properties.title);
    });
  }

  loadSheet() {
    (gapi.client as any).sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.currentSheetName + '!readData',
    }).then((response) => {
      if (response && response.result && response.result.values) {
        this.sheet = response.result.values;
      }
    });
  }

  setSheet(sheetName: string) {
    this.currentSheetName = sheetName;
    this.loadSheet();
  }

  getSheet(): string[][] {
    return this.sheet;
  }
}
