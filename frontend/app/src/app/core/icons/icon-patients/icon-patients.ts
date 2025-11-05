import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-patients',
  imports: [NgStyle],
  templateUrl: './icon-patients.html',
})
export class IconPatients extends IconComponent {}
