import { Pipe, PipeTransform } from '@angular/core';
import { TPasswordStrengthLevel } from '../../features/crypto/types/password.types';

@Pipe({
  name: 'strengthClassPipe',
})
export class StrengthClassPipePipe implements PipeTransform {
  transform(strength: TPasswordStrengthLevel): string {
    return `strength-${strength}`;
  }
}
