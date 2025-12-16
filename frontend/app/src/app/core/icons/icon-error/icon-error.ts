import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-error',
  imports: [NgStyle],
  templateUrl: './icon-error.html',
})
export class IconError extends AbstractIconComponent {

}
