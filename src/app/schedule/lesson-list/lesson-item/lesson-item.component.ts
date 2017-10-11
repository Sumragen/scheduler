import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-lesson-item',
  templateUrl: './lesson-item.component.html',
  styleUrls: ['./lesson-item.component.css', '../../../share/common.css']
})
export class LessonItemComponent implements OnInit {
  @Input() lesson;

  constructor() {
  }

  ngOnInit() {
  }

}
