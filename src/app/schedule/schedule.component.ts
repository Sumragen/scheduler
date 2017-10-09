import {Component, OnInit} from '@angular/core';
import {ScheduleService} from './schedule.service';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import * as moment from 'moment';

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

  teachers: any;

  itsLeft: string;

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  emptySix = _.range(6);

  ringsCall = ['8:30', '9:50', '10:10', '11:30', '11:50', '13:10', '13:40', '15:00', '15:20', '16:40', '17:00', '18:20'];

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
    this.scheduleService.getRawData()
      .subscribe((data) => {
        this.onFileChange({files: [data]});
      });
    setInterval(() => {
      this.itsLeft = '* min';
      _.every(this.ringsCall, (val, index) => {
        const nTime = this.ringsCall[index + 1];
        if (this.isInTimeRange(val, nTime)) {
          const now = new Date();
          const nowInMinutes = moment.duration(now.getHours() + ':' + now.getMinutes());
          this.itsLeft = Math.abs((moment.duration(nowInMinutes).asMinutes() - moment.duration(nTime).asMinutes())) + ' min';
          return false;
        }
        return true;
      });
    }, 1000);
  }

  isInTimeRange(from, to) {
    const today = new Date().getHours() + ':' + new Date().getMinutes();
    return moment.duration(today) >= moment.duration(from) && moment.duration(today) < moment.duration(to);
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
    this.data = <AOA>(XLSX.utils.sheet_to_json(this.scheduleWS, {header: 1}));
    this.groups = this.scheduleService.transform(this.data).groups;
    this.teachers = this.scheduleService.transform(this.data).teachers;
    this.groupOptions = _.map({...this.groups, ...this.teachers}, (val, key) => {
      return {
        label: key,
        value: key
      };
    });
    if (this.groupName) {
      this.renderSchedule();
    }
  }

  renderSchedule() {
    localStorage.setItem('groupName', this.groupName);
    console.log(this.teachers[this.groupName]);
    this.schedule = this.groups[this.groupName] ? this.groups[this.groupName].schedule : this.teachers[this.groupName];
  }
}
