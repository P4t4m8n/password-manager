import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-logo',
  imports: [NgStyle],
  templateUrl: './icon-logo.html',
})
export class IconLogo extends AbstractIconComponent {}
{
}
