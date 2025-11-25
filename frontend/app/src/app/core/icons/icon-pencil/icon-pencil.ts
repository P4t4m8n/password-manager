import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-pencil',
  imports: [NgStyle],
  templateUrl: './icon-pencil.html',
})
export class IconPencil extends IconComponent {}
