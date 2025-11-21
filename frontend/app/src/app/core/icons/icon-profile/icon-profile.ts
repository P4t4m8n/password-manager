import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-profile',
  imports: [NgStyle],
  templateUrl: './icon-profile.html',
  styleUrl: './icon-profile.css',
})
export class IconProfile extends IconComponent {}
