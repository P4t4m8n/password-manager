import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-signout',
  imports: [NgStyle],
  templateUrl: './icon-signout.html',
})
export class IconSignout extends AbstractIconComponent {}
