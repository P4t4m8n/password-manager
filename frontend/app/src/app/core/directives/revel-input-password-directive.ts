import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appRevealPassword]',
})
export class RevelInputPasswordDirective {
  @Input('appRevealPassword') inputElement!: HTMLInputElement;

  @HostListener('click')
  onClick() {
    if (this.inputElement) {
      const currentType = this.inputElement.type;
      this.inputElement.type = currentType === 'password' ? 'text' : 'password';
    }
  }
}
