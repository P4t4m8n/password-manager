import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-password-generator',
  imports: [NgStyle],
  templateUrl: './icon-password-generator.html',
})
export class IconPasswordGenerator extends IconComponent {}
