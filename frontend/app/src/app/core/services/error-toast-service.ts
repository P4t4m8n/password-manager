import { inject, Injectable } from '@angular/core';
import { ToastService } from '../toast/services/toast-service';

@Injectable({
  providedIn: 'root',
})
export class ErrorToastService {
  private _toastService = inject(ToastService);

  handleError(error: unknown) {}
}
