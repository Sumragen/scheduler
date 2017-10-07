import {Component, OnInit} from '@angular/core';
import {ScheduleService} from './schedule.service';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

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

  groupOptions: any;

  groupName: any;

  schedule: any;

  groups: any;

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  selectedDay: number;

  constructor(private scheduleService: ScheduleService) {
    const currentDay = new Date().getDay();
    if (currentDay === 0 || currentDay === 6) {
      this.selectedDay = 0;
    } else {
      this.selectedDay = currentDay - 1;
    }
  }

  ngOnInit() {
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
      this.currentWeekType = this.weekTypes[0];
      this.updateGroupData();
    };
    reader.readAsBinaryString(evt.files[0]);
  }

  updateGroupData() {
    this.scheduleWS = this.scheduleWB.Sheets[this.currentWeekType];
    this.data = <AOA>(XLSX.utils.sheet_to_json(this.scheduleWS, {header: 1}));
    this.groups = this.scheduleService.transform(this.data);
    this.groupOptions = _.map(this.groups, (val, key) => {
      return {
        label: key,
        value: key
      };
    });
  }

  renderSchedule() {
    this.schedule = this.groups[this.groupName].schedule;
  }
}
