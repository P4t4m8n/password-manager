import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-close-open',
  imports: [NgStyle],
  templateUrl: './icon-close-open.html',
})
export class IconCloseOpen extends IconComponent {}
