import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-warn',
  imports: [NgStyle],
  templateUrl: './icon-warn.html',
})
export class IconWarn extends IconComponent {

}
