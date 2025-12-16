import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-close-open',
  imports: [NgStyle],
  templateUrl: './icon-close-open.html',
})
export class IconCloseOpen extends AbstractIconComponent {}
