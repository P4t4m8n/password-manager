import { inject, Injectable } from '@angular/core';
import { ToastService } from '../toast/services/toast-service';
import { toastTypes } from '../toast/interface/toastData';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  private toastService = inject(ToastService);

  async copyToClipboard(text?: string | null): Promise<void> {
    if (!text) {
      throw new Error('No text provided to copy to clipboard');
    }

    try {
      await navigator.clipboard.writeText(text);
      this.toastService.initiate({
        title: 'Success',
        content: 'Password copied to clipboard!',
        type: toastTypes.success,
      });
    } catch (err) {
      console.error('Failed to copy password:', err);
      throw err;
    }
  }
}
