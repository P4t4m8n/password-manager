import { Directive, Input } from '@angular/core';

@Directive({})
export abstract class AbstractIconComponent {
  @Input() style: Partial<Record<keyof CSSStyleDeclaration, string | number>> = {};
}
