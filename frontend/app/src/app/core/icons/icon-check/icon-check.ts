import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-check',
  imports: [NgStyle],
  templateUrl: './icon-check.html',
})
export class IconCheck extends AbstractIconComponent {}
