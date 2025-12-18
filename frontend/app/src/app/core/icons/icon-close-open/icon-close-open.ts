import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-close-open',
  imports: [NgStyle],
  templateUrl: './icon-close-open.html',
  styleUrl: '../icons.css',
})
export class IconCloseOpen extends AbstractIconComponent {}
