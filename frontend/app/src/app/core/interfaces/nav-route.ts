import type { Type } from '@angular/core';
import type { IconComponent } from '../abstracts/icon-component';

export interface INavRoute {
  route: string;
  label: string;
  icon: Type<IconComponent>;
}
