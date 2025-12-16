import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-trash',
  imports: [NgStyle],
  templateUrl: './icon-trash.html',
})
export class IconTrash extends AbstractIconComponent {}
