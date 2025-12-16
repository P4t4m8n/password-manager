import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-settings',
  imports: [NgStyle],
  templateUrl: './icon-settings.html',
})
export class IconSettings extends AbstractIconComponent {}
