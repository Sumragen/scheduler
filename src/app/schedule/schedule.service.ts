import {Injectable} from '@angular/core';
import {GoogleApiService} from 'ng-gapi';
import * as _ from 'lodash';
import {Http, ResponseContentType} from '@angular/http';

@Injectable()
export class ScheduleService {
  constructor(private gapiService: GoogleApiService, private http: Http) {
    gapiService.onLoad().subscribe(() => {
      console.log('log');
    });
  }

  private fillSchedule(data, index, classIndexes) {
    const schedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    _.each(days, (day, ind) => {
      schedule[day] = [];
      _.each(_.range(5), (num) => {
        const offset = num + 1 + 6 * ind;
        if (!!data[classIndexes[offset]][index]) {
          schedule[day].push({
            name: data[classIndexes[offset]][index] + ' ' + (data[classIndexes[offset] + 1][index] || ''),
            room: data[classIndexes[offset + 1] - 1][index] || '',
            teacher: data[classIndexes[offset + 1] - 2][index] || data[classIndexes[offset + 1] - 3][index] || '',
            class: num + 2
          });
        }
      });
    });
    return schedule;
  }

  getRawData() {
    return this.http.get(`assets/doc_example.xls`, {responseType: ResponseContentType.Blob})
      .map(res => res.blob());
  }

  transform(data) {
    const ROW_MAP = {
      SPECIALIZATION: 9,
      GROUP: 12
    };
    const COL_MAP = {
      CLASS_NUMBER: 1
    };
    const groups: object = {};
    const prefix = '15-9-';
    const classIndexes = [];
    _.each(data, (row, index) => {
      if (!!row[COL_MAP.CLASS_NUMBER]) {
        classIndexes.push(index);
      }
    });
    _.each(data[ROW_MAP.GROUP], (value, index) => {
      if (!!value && value.indexOf(prefix) > -1) {
        value = value.split(prefix)[1];
        groups[value] = {
          index: index,
          name: value,
          specialization: data[ROW_MAP.SPECIALIZATION][index],
          schedule: this.fillSchedule(data, index, classIndexes)
        };
      }
    });
    return groups;
  }
}
