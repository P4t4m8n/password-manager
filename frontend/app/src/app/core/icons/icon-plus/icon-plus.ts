import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-plus',
  imports: [NgStyle],
  templateUrl: './icon-plus.html',
  styleUrl: './icon-plus.css',
})
export class IconPlus extends IconComponent {}
