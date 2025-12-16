import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-safety',
  imports: [NgStyle],
  templateUrl: './icon-safety.html',
})
export class IconSafety extends AbstractIconComponent {}
