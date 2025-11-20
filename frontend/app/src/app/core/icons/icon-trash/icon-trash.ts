import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-trash',
  imports: [NgStyle],
  templateUrl: './icon-trash.html',
  styleUrl: './icon-trash.css',
})
export class IconTrash extends IconComponent {}
