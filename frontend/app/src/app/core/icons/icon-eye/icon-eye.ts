import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-eye',
  imports: [NgStyle],
  templateUrl: './icon-eye.html',
})
export class IconEye extends AbstractIconComponent {

}
