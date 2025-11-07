import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-arrow',
  imports: [NgStyle],
  templateUrl: './icon-arrow.html',
})
export class IconArrow extends IconComponent {}
