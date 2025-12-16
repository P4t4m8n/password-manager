import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-profile',
  imports: [NgStyle],
  templateUrl: './icon-profile.html',
})
export class IconProfile extends AbstractIconComponent {}
