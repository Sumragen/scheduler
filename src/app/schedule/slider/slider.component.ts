import {Component, OnInit} from '@angular/core';
import {ScheduleService} from '../schedule.service';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements OnInit {

  days: string[];

  selectedDay: number;

  constructor(private scheduleService: ScheduleService) {
  }

  ngOnInit() {
    this.selectedDay = this.scheduleService.dayOfWeek;
    this.days = this.scheduleService.days;
  }

  dayChanged(evt) {
    this.scheduleService.dayOfWeek = evt.value;
  }
}
