import {Component, Input, OnInit} from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import {ScheduleService} from '../schedule.service';

@Component({
  selector: 'app-lesson-list',
  templateUrl: './lesson-list.component.html',
  styleUrls: ['./lesson-list.component.css', '../../share/common.css']
})
export class LessonListComponent implements OnInit {
  emptySix = _.range(6);

  days: string[];

  ringsCall = ['8:30', '9:50', '10:10', '11:30', '11:50', '13:10', '13:40', '15:00', '15:20', '16:40', '17:00', '18:20'];

  @Input() schedule;

  constructor(private scheduleService: ScheduleService) {
  }

  ngOnInit() {
    this.days = this.scheduleService.days;
  }

  getLessons() {
    const selectedDay = this.scheduleService.dayOfWeek;
    return this.schedule[this.days[selectedDay]] || {};
  }

  isInTimeRange(from, to) {
    return this.scheduleService.isInTimeRange(from, to);
  }

}
