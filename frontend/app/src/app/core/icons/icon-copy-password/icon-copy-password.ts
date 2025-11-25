import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-copy-password',
  imports: [NgStyle],
  templateUrl: './icon-copy-password.html',
})
export class IconCopyPassword extends IconComponent {
  @Input() showKeyhole: boolean = true;
}
