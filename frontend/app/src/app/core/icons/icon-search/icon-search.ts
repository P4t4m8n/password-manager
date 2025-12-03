import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-search',
  imports: [NgStyle],
  templateUrl: './icon-search.html',
})
export class IconSearch extends IconComponent {}
