import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-open-external',
  imports: [NgStyle],
  templateUrl: './icon-open-external.html',
  styleUrl: './icon-open-external.css',
})
export class IconOpenExternal extends IconComponent {}
