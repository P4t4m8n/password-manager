import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-favorite',
  imports: [NgStyle],
  templateUrl: './icon-favorite.html',
  styleUrl: './icon-favorite.css',
})
export class IconFavorite extends IconComponent {

}
