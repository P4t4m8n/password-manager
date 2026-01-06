import { Component, inject, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorService } from '../../../../core/services/error-service';
import { CryptoService } from '../../services/crypto-service';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-show-password',
  imports: [IconEye, IconCopyPassword, AsyncPipe],
  templateUrl: './show-password.html',
  styleUrl: './show-password.css',
})
export class ShowPassword {
  @Input({ required: true }) encryptedPassword?: string = '';
  @Input({ required: true }) iv?: string = '';

  #cryptoService = inject(CryptoService);

  #errorService = inject(ErrorService);

  #password = new BehaviorSubject<string>('******');
  public password$ = this.#password.asObservable();

  async onShowPassword() {
    try {
      const decryptedPassword = await this.#cryptoService.decryptPassword(
        this.encryptedPassword,
        this.iv
      );
      this.#password.next(decryptedPassword);
    } catch (error) {
      this.#errorService.handleError(error, { showToast: true });
    }
  }
}
