import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { IconArrow } from "../../icons/icon-arrow/icon-arrow";

@Component({
  selector: 'app-back-button',
  imports: [IconArrow],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  private location = inject(Location);

  onBack(): void {
    this.location.back();
  }
}
