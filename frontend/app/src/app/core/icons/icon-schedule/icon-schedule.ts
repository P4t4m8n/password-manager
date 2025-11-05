import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-schedule',
  imports: [NgStyle],
  templateUrl: './icon-schedule.html',
})
export class IconSchedule extends IconComponent {}
