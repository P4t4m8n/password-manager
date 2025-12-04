import { Directive, Input } from '@angular/core';

@Directive()
export abstract class IconComponent {
  @Input() style: Partial<Record<keyof CSSStyleDeclaration, string | number>> = {};
}
