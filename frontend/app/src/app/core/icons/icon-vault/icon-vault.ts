import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractIconComponent } from '../../abstracts/icon-component.abstract';

@Component({
  selector: 'app-icon-vault',
  imports: [NgStyle],
  templateUrl: './icon-vault.html',
})
export class IconVault extends AbstractIconComponent {}
