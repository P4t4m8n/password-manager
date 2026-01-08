import { Pipe, PipeTransform } from '@angular/core';
import type { TPasswordStrength } from '../../features/crypto/services/password-evaluator-service';

@Pipe({
  name: 'strengthClassPipe',
})
export class StrengthClassPipePipe implements PipeTransform {
  transform(strength: TPasswordStrength): string {
    return `strength-${strength}`;
  }
}
