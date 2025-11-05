import { Type } from '@angular/core';
import { IconComponent } from '../abstracts/icon-component';

export interface INavRoute {
  route: string;
  label: string;
  icon: Type<IconComponent>;
}
