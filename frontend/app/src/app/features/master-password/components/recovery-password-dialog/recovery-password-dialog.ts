import { Component, inject, Input } from '@angular/core';
import { AbstractDialog } from '../../../../core/abstracts/dialog.abstract';
import { ClipboardService } from '../../../../core/services/clipboard-service';
import { CryptoService } from '../../../crypto/services/crypto-service';
import { AuthHttpService } from '../../../auth/services/auth-http-service';

@Component({
  selector: 'app-recovery-password-dialog',
  imports: [],
  templateUrl: './recovery-password-dialog.html',
  styleUrl: './recovery-password-dialog.css',
})
export class RecoveryPasswordDialog extends AbstractDialog<void> {
  @Input({ required: true }) recoveryKey!: Uint8Array<ArrayBufferLike>;

  #authHttpService = inject(AuthHttpService);

  #clipboardService = inject(ClipboardService);
  #cryptoService = inject(CryptoService);
  recoveryStr: string = '';

  ngOnInit(): void {
    this.recoveryStr = this.#cryptoService.arrayBufferToBase64(this.recoveryKey);
  }

  override submit(): void {
    this.resolve();
  }

  async onCopyRecoveryToClipboard(): Promise<void> {
    const recoveryStr = this.#cryptoService.arrayBufferToBase64(this.recoveryKey);
    await this.#clipboardService.copyToClipboard(recoveryStr);
  }

  onDownloadRecovery(): void {
    const email = this.#authHttpService.get_session_user()?.email ?? '';
    this.#cryptoService.downloadRecoveryKey(this.recoveryKey, email);
  }
}
