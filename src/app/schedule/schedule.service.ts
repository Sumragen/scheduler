import { Injectable } from '@angular/core';
import { GoogleApiService } from 'ng-gapi';
import * as _ from 'lodash';
import { Http, ResponseContentType } from '@angular/http';
import * as moment from 'moment';
import { GoogleService } from '../share/google/google.service';

@Injectable()
export class ScheduleService {

  teachers: object = {};

  dayOfWeek: number = (new Date().getDay() || 7) - 1;
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  constructor(private gapiService: GoogleApiService,
              private http: Http,
              private googleService: GoogleService) {
  }

  public setDayOfWeek(day: number) {
    this.dayOfWeek = day;
  }

  private parseLesson(groupRowIndex, groupColIndex) {
    const data = this.googleService.getSheet();
    const lesson = data[groupRowIndex][groupColIndex] + ' ' + (data[groupRowIndex + 1][groupColIndex] ||
      '' + (!data[groupRowIndex + 3][groupColIndex] ? ' ' + data[groupRowIndex + 2][groupColIndex] : ''));

    let teacher = data[groupRowIndex + 3][groupColIndex] || data[groupRowIndex + 2][groupColIndex];
    teacher = teacher.replace(/\s/g, '').replace(/\.\./g, '\.').replace(/\./g, '\. ');

    const room = data[groupRowIndex + 4][groupColIndex];
    return {
      room: room,
      teacher: teacher,
      name: lesson
    }
  }

  private fillSchedule(groupColIndex, groupIndexes, groupName) {
    const schedule = {};
    const ROW_AMOUNT = 5;
    const AMOUNT_OF_CLASSES_IN_DAY = 6;
    const data = this.googleService.getSheet();
    _.each(this.days, (day, dayIndex) => {
      schedule[day] = [];
      // fill each day of week
      _.each(_.range(ROW_AMOUNT), (dayRowIndex) => {
        const offset = dayRowIndex + AMOUNT_OF_CLASSES_IN_DAY * dayIndex;
        const groupRowIndex = groupIndexes[offset];
        if (!!data[groupRowIndex][groupColIndex]) {
          const fGLesson = this.parseLesson(groupRowIndex, groupColIndex);
          const classIndex = dayRowIndex;

          let sGLesson;
          const subLessonName = data[groupRowIndex][groupColIndex + 1];
          const isSubLessonExist = subLessonName === 'x' || !!subLessonName;
          if (subLessonName) {
            sGLesson = this.parseLesson(groupRowIndex, groupColIndex + 1);
          }
          let lesson;
          if (isSubLessonExist) {
            lesson = {
              isBySubGroup: true,
              subGroupOne: fGLesson,
              subGroupTwo: sGLesson
            };
          } else {
            lesson = fGLesson;
          }
          schedule[day][classIndex] = lesson;
          const teacherList = [fGLesson.teacher];
          if (sGLesson) {
            teacherList.push(sGLesson.teacher);
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
            // TODO remove that shit! use property groups instead of that bullshit
            if (!!existLesson) {
              lessonObj = {
                room: !tIndex ? fGLesson.room : sGLesson.room,
                name: !tIndex ? fGLesson.name : sGLesson.name,
                groups: existLesson.group ? [existLesson.group, groupName] : existLesson.groups.concat(groupName)
              };
              if (lessonObj.group) {
                delete lessonObj.group;
              }
            } else {
              lessonObj = {
                room: !tIndex ? fGLesson.room : sGLesson.room,
                name: !tIndex ? fGLesson.name : sGLesson.name,
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

  newTransform() {
    const data = this.googleService.getSheet();
    this.teachers = {};
    const ROW_MAP = {
      GROUP: 0
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

    console.log(data[ROW_MAP.GROUP]);
    _.each(data[ROW_MAP.GROUP], (groupNumber, groupIndex) => {
      if (!!groupNumber && groupNumber.indexOf(prefix) > -1) {
        groupNumber = groupNumber.split(prefix)[1];
        groups[groupNumber] = {
          index: groupIndex,
          name: groupNumber,
          schedule: this.fillSchedule(groupIndex, classIndexes, groupNumber)
        };
      }
    });
    return {
      groups, teachers: this.teachers
    };
  }

  transform(data) {
    this.teachers = {};
    const ROW_MAP = {
      SPECIALIZATION: 9,
      GROUP: 0
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
    console.log(data[ROW_MAP.GROUP]);
    _.each(data[ROW_MAP.GROUP], (value, index) => {
      if (!!value && value.indexOf(prefix) > -1) {
        value = value.split(prefix)[1];
        groups[value] = {
          index: index,
          name: value,
          schedule: this.fillSchedule(index, classIndexes, value)
        };
      }
    });
    return {
      groups, teachers: this.teachers
    };
  }

  isInTimeRange(from, to) {
    const today = new Date().getHours() + ':' + new Date().getMinutes();
    return moment.duration(today) >= moment.duration(from) && moment.duration(today) < moment.duration(to);
  }
}
