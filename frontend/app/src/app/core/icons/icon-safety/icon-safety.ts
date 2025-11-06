import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-safety',
  imports: [NgStyle],
  templateUrl: './icon-safety.html',
})
export class IconSafety extends IconComponent {}
