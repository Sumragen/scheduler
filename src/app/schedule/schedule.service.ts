import {Injectable} from '@angular/core';
import {GoogleApiService} from 'ng-gapi';
import * as _ from 'lodash';
import {Http, ResponseContentType} from '@angular/http';

@Injectable()
export class ScheduleService {

  teachers: object = {};

  constructor(private gapiService: GoogleApiService, private http: Http) {
    gapiService.onLoad().subscribe(() => {
      console.log('gapi log');
    });
  }

  private fillSchedule(data, index, classIndexes, groupName) {
    const schedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    _.each(days, (day, ind) => {
      schedule[day] = [];
      _.each(_.range(5), (num) => {
        const offset = num + 6 * ind;
        if (!!data[classIndexes[offset]][index]) {
          const lessonName = data[classIndexes[offset]][index] + ' ' + (data[classIndexes[offset] + 1][index] ||
            '' + (!data[classIndexes[offset] + 3][index] ? ' ' + data[classIndexes[offset] + 2][index] : ''));
          let teacher = data[classIndexes[offset] + 3][index] || data[classIndexes[offset] + 2][index];
          teacher = teacher.replace(/\s/g, '').replace(/\.\./g, '\.').replace(/\./g, '\. ');

          const room = data[classIndexes[offset] + 4][index];
          const classIndex = num;
          let lesson;
          if (teacher.indexOf('|') > -1) {
            lesson = {
              isBySubGroup: true,
              subGroupOne: {
                room: room.split(' ')[0],
                teacher: teacher.split('|')[0],
                name: lessonName.split('|')[0]
              },
              subGroupTwo: {
                room: room.split(' ')[1],
                teacher: teacher.split('|')[1],
                name: lessonName.split('|')[1]
              }
            };
          } else {
            lesson = {
              name: lessonName,
              room: room || '',
              teacher: teacher
            };
          }
          schedule[day][classIndex] = lesson;
          let teacherList;
          if (teacher.indexOf('|') > -1) {
            teacherList = _.map(teacher.split('|'), val => typeof val === 'string' ? val.trim() : val);
          } else {
            teacherList = [teacher];
          }
          _.each(teacherList, (teacherName, tIndex) => {
            if (!this.teachers[teacherName]) {
              this.teachers[teacherName] = {
                [day]: []
              };
            } else {
              if (!this.teachers[teacherName][day]) {
                this.teachers[teacherName][day] = [];
              }
            }
            let lessonObj;
            const existLesson = this.teachers[teacherName][day][classIndex];
            if (!!existLesson) {
              lessonObj = {
                room: !!room ? room.split(' ')[tIndex] : '',
                name: lessonName.split('|')[tIndex],
                groups: existLesson.group ? [existLesson.group, groupName] : existLesson.groups.concat(groupName)
              };
              if (lessonObj.group) {
                delete lessonObj.group;
              }
            } else {
              lessonObj = {
                room: !!room ? room.split(' ')[tIndex] : '',
                name: lessonName.split('|')[tIndex],
                group: groupName
              };
            }
            this.teachers[teacherName][day][classIndex] = lessonObj;
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
    this.teachers = {};
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
