import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-plus',
  imports: [NgStyle],
  templateUrl: './icon-plus.html',
  styleUrl: '../icons.css',
})
export class IconPlus extends AbstractIconComponent {}
