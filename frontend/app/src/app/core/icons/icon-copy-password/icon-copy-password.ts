import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-copy-password',
  imports: [NgStyle],
  templateUrl: './icon-copy-password.html',
})
export class IconCopyPassword extends AbstractIconComponent {
  @Input() showKeyhole: boolean = true;
}
