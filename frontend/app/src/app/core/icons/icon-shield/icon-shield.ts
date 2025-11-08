import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-shield',
  imports: [NgStyle],
  templateUrl: './icon-shield.html',
  styleUrl: './icon-shield.css',
})
export class IconShield extends IconComponent {}
