import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-check',
  imports: [NgStyle],
  templateUrl: './icon-check.html',
})
export class IconCheck extends IconComponent {}
