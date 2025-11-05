import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-dashboard',
  imports: [NgStyle],
  templateUrl: './icon-dashboard.html',
})
export class IconDashboard extends IconComponent {}
