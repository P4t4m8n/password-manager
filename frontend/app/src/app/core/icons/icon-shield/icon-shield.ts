import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-shield',
  imports: [NgStyle],
  templateUrl: './icon-shield.html',
})
export class IconShield extends AbstractIconComponent {}
