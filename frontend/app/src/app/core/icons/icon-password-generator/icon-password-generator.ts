import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-password-generator',
  imports: [NgStyle],
  templateUrl: './icon-password-generator.html',
  styleUrl: '../icons.css',
})
export class IconPasswordGenerator extends AbstractIconComponent {}
