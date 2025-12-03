import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-dots',
  imports: [NgStyle],
  templateUrl: './icon-dots.html',
})
export class IconDots extends IconComponent {

}
