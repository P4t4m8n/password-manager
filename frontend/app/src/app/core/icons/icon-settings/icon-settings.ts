import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-settings',
  imports: [NgStyle],
  templateUrl: './icon-settings.html',
})
export class IconSettings extends IconComponent {}
