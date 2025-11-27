import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-signout',
  imports: [NgStyle],
  templateUrl: './icon-signout.html',
})
export class IconSignout extends IconComponent {}
