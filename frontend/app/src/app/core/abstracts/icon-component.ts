import { Directive, Input } from '@angular/core';

@Directive()
export  class IconComponent {
  @Input() style: Partial<Record<keyof CSSStyleDeclaration, string | number>> = {};
}
