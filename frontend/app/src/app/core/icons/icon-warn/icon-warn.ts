import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-warn',
  imports: [NgStyle],
  templateUrl: './icon-warn.html',
})
export class IconWarn extends AbstractIconComponent {

}
