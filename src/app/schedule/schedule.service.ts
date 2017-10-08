import {Injectable} from '@angular/core';
import {GoogleApiService} from 'ng-gapi';
import * as _ from 'lodash';
import {Http, ResponseContentType} from '@angular/http';

@Injectable()
export class ScheduleService {

  groups: object;

  teachers: object = {};

  constructor(private gapiService: GoogleApiService, private http: Http) {
    gapiService.onLoad().subscribe(() => {
      console.log('log');
    });
  }

  private fillSchedule(data, index, classIndexes, groupName) {
    const schedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    _.each(days, (day, ind) => {
      schedule[day] = [];
      _.each(_.range(5), (num) => {
        const offset = num + 1 + 6 * ind;
        if (!!data[classIndexes[offset]][index]) {
          const lessonName = data[classIndexes[offset]][index] + ' ' + (data[classIndexes[offset] + 1][index] ||
            '' + (!data[classIndexes[offset] + 3][index] ? ' ' + data[classIndexes[offset] + 2][index] : ''));
          const teacher = data[classIndexes[offset] + 3][index] || data[classIndexes[offset] + 2][index];
          const room = data[classIndexes[offset] + 4][index];
          const classIndex = num + 2;
          schedule[day].push({
            name: lessonName,
            room: room || '',
            teacher: teacher,
            class: classIndex
          });
          if (!this.teachers[teacher]) {
            this.teachers[teacher] = {
              [day]: []
            };
          } else {
            if (!this.teachers[teacher][day]) {
              this.teachers[teacher][day] = [];
            }
          }
          this.teachers[teacher][day].push({
            class: classIndex,
            name: lessonName,
            group: groupName
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
          schedule: this.fillSchedule(data, index, classIndexes, value)
        };
      }
    });
    return {
      groups, teachers: this.teachers
    };
  }
}
