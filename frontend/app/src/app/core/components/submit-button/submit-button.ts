import { Component, Input } from '@angular/core';
import { NgClass } from '../../../../../node_modules/@angular/common/types/_common_module-chunk';

@Component({
  selector: 'app-submit-button',
  imports: [],
  templateUrl: './submit-button.html',
  styleUrl: './submit-button.css',
})
export class SubmitButton {
  @Input({ required: true }) isDisabled: boolean = false;
  @Input({ required: true }) isLoading: boolean | null = false;
  @Input({ required: true }) buttonText: string = 'Save';
  @Input() buttonLoadingText?: string;

  public getButtonText(): string {
    return this.isLoading && this.buttonLoadingText ? this.buttonLoadingText : this.buttonText;
  }
}
