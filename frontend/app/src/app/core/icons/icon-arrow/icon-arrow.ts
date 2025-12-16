import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-arrow',
  imports: [NgStyle],
  templateUrl: './icon-arrow.html',
})
export class IconArrow extends AbstractIconComponent {}
