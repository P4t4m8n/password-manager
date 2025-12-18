import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-favorite',
  imports: [NgStyle],
  templateUrl: './icon-favorite.html',
  styleUrl: '../icons.css',
})
export class IconFavorite extends AbstractIconComponent {}
