import type { Type } from '@angular/core';
import type { AbstractIconComponent } from '../abstracts/icon-component.abstract';

export interface INavRoute {
  route: string;
  label: string;
  icon: Type<AbstractIconComponent>;
}
