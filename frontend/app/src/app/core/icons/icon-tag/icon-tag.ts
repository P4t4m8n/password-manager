import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-tag',
  imports: [NgStyle],
  templateUrl: './icon-tag.html',
})
export class IconTag extends IconComponent {}
