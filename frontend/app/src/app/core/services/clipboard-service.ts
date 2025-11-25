import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  async copyToClipboard(text?: string): Promise<void> {
    if (!text) {
      throw new Error('No text provided to copy to clipboard');
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy password:', err);
      throw err;
    }
  }
}
