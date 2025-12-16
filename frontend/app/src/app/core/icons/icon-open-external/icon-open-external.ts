import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-open-external',
  imports: [NgStyle],
  templateUrl: './icon-open-external.html',
})
export class IconOpenExternal extends AbstractIconComponent {}
