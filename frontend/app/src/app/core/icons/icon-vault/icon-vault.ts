import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../abstracts/icon-component';

@Component({
  selector: 'app-icon-vault',
  imports: [NgStyle],
  templateUrl: './icon-vault.html',
})
export class IconVault extends IconComponent {}
