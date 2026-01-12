import { Component, Input } from '@angular/core';
import { Loader } from '../loader/loader';

@Component({
  selector: 'app-submit-button',
  imports: [Loader],
  templateUrl: './submit-button.html',
  styleUrl: './submit-button.css',
})
export class SubmitButton {
  @Input({ required: true }) isDisabled: boolean = false;
  @Input({ required: true }) isLoading: boolean | null = false;
  @Input({ required: true }) buttonText: string = 'Save';
  @Input() buttonLoadingText?: string;

  // Keeping it here for now, to maybe resue the aniomation logic later
  // public getButtonText(): string {
  //   return this.isLoading && this.buttonLoadingText ? this.buttonLoadingText : this.buttonText;
  // }
}
