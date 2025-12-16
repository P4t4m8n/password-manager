import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-icon-search',
  imports: [NgStyle],
  templateUrl: './icon-search.html',
})
export class IconSearch extends AbstractIconComponent {}
