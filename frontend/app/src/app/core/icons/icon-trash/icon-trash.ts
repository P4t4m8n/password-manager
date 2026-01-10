import { Component, Input } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-trash',
  imports: [NgStyle],
  templateUrl: './icon-trash.html',
  styleUrl: './icon-trash.css',
})
export class IconTrash extends AbstractIconComponent {
  @Input() isLidOpen: boolean = false;
}
