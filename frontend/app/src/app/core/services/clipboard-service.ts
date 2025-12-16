import { inject, Injectable } from '@angular/core';

import { toastTypes } from '../toast/enum/toast-type.enum';

import { ToastService } from '../toast/services/toast-service';
import { ErrorService } from './error-service';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  #toastService = inject(ToastService);
  #errorService = inject(ErrorService);

  async copyToClipboard(text?: string | null): Promise<void> {
    try {
      if (!text) {
        throw new Error('No text provided to copy to clipboard');
      }
      await navigator.clipboard.writeText(text);
      this.#toastService.initiate({
        title: 'Success',
        content: 'Copied to clipboard!',
        type: toastTypes.success,
      });
    } catch (err) {
      this.#errorService.handleError(err, { showToast: true });
    }
  }
}
