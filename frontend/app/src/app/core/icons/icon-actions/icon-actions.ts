import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-actions',
  imports: [NgStyle],
  templateUrl: './icon-actions.html',
  styleUrl: './icon-actions.css',
})
export class IconActions extends IconComponent {}
