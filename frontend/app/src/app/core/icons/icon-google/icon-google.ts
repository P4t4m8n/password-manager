import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-google',
  imports: [NgStyle],
  templateUrl: './icon-google.html',
  styleUrl: './icon-google.css',
})
export class IconGoogle extends AbstractIconComponent {}
