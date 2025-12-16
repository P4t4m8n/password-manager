import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-tag',
  imports: [NgStyle],
  templateUrl: './icon-tag.html',
})
export class IconTag extends AbstractIconComponent {}
