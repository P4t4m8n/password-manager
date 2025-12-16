import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-dots',
  imports: [NgStyle],
  templateUrl: './icon-dots.html',
})
export class IconDots extends AbstractIconComponent {

}
