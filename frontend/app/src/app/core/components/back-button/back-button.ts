import { Component, inject, Input } from '@angular/core';
import { Location } from '@angular/common';
import { IconArrow } from '../../icons/icon-arrow/icon-arrow';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  imports: [IconArrow],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  @Input() locationPath?: string;
  private location = inject(Location);
  private router = inject(Router);

  onBack(): void {
    if (this.locationPath) {
      this.router.navigate([this.locationPath]);
      return;
    }
    this.location.back();
  }
}
