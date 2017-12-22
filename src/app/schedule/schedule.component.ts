import { Component, OnInit } from '@angular/core';
import { ScheduleService } from './schedule.service';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import * as moment from 'moment';
import { GoogleService } from '../share/google/google.service';

type AOA = Array<Array<any>>;

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  data: any;

  scheduleWB: XLSX.WorkBook;

  scheduleWS: XLSX.WorkSheet;

  weekTypes: any = [];

  currentWeekType: any = null;

  groupOptions: any = [];

  groupName: any;

  schedule: any;

  groups: any = [];

  teachers: any = [];

  itsLeft: string;

  ringsCall = ['8:30', '9:50', '10:10', '11:30', '11:50', '13:10', '13:40', '15:00', '15:20', '16:40', '17:00', '18:20'];

  selectedDay: number;

  constructor(private scheduleService: ScheduleService,
              private googleService: GoogleService) {
    const currentDay = new Date().getDay();
    if (currentDay === 0 || currentDay === 6) {
      this.selectedDay = 0;
    } else {
      this.selectedDay = currentDay - 1;
    }
  }

  ngOnInit() {
    this.scheduleService.getRawData()
      .subscribe((data) => {
        this.onFileChange({files: [data]});
      });
    this.itsLeft = '* min';
    const ringsCallDuration = _.map(this.ringsCall, val => moment.duration(val).asMinutes());
    setInterval(() => {
      _.every(this.ringsCall, (val, index) => {
        const nTime = this.ringsCall[index + 1];
        if (this.scheduleService.isInTimeRange(val, nTime)) {
          const now = new Date();
          const nowInMinutes = moment.duration(now.getHours() + ':' + now.getMinutes());
          this.itsLeft = (ringsCallDuration[index + 1] - moment.duration(nowInMinutes).asMinutes()) + ' min';
          return false;
        }
        return true;
      });
    }, 1000);
  }


  onFileChange(evt: any) {
    if (evt.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      this.scheduleWB = XLSX.read(bstr, {type: 'binary'});

      this.weekTypes = _.map(this.scheduleWB.SheetNames, val => {
        return {label: val, value: val};
      });
      this.currentWeekType = JSON.parse(localStorage.getItem('currentWeekType')) || this.weekTypes[0];
      this.groupName = localStorage.getItem('groupName');
      this.updateGroupData();
    };
    reader.readAsBinaryString(evt.files[0]);
  }

  updateGroupData() {
    localStorage.setItem('currentWeekType', JSON.stringify(this.currentWeekType.value || this.currentWeekType));
    this.scheduleWS = this.scheduleWB.Sheets[this.currentWeekType];
    // this.googleService.setSheet(this.currentWeekType);
    setTimeout(() => {
      this.data = this.googleService.getSheet();
      // this.data = <AOA>(XLSX.utils.sheet_to_json(this.scheduleWS, {header: 1}));
      const dataTransform = this.scheduleService.newTransform();
      console.log(dataTransform);
      this.groups = dataTransform.groups;
      this.teachers = dataTransform.teachers;
      this.groupOptions = _.map({...dataTransform.groups, ...dataTransform.teachers}, (val, key) => {
        return {
          label: key,
          value: key
        };
      });
      if (this.groupName) {
        this.renderSchedule();
      }
    }, 5000);
  }

  renderSchedule() {
    localStorage.setItem('groupName', this.groupName);
    this.schedule = this.groups[this.groupName] ? this.groups[this.groupName].schedule : this.teachers[this.groupName];
  }
}
