import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-pencil',
  imports: [NgStyle],
  templateUrl: './icon-pencil.html',
})
export class IconPencil extends AbstractIconComponent {}
