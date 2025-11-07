import { Type } from '@angular/core';

export interface DialogButtonConfig {
  text?: string;
  icon?: Type<any>;
  style?: Partial<Record<keyof CSSStyleDeclaration, string | number>>;
  class?: string;
}

export interface DialogConfig {
  buttonConfig: DialogButtonConfig;
  contentComponent: Type<any>;
  onClose?: () => void;
}
