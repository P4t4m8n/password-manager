import { Component, inject, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { IconArrow } from '../../icons/icon-arrow/icon-arrow';

@Component({
  selector: 'app-back-button',
  imports: [IconArrow],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  @Input() locationPath?: string;
  #location = inject(Location);
  #router = inject(Router);

  onBack(): void {
    if (this.locationPath) {
      this.#router.navigate([this.locationPath]);
      return;
    }
    this.#location.back();
  }
}
