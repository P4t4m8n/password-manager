import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-error',
  imports: [NgStyle],
  templateUrl: './icon-error.html',
  styleUrl: './icon-error.css',
})
export class IconError extends IconComponent {

}
