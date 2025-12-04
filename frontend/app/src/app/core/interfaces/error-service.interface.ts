import type { FormGroup } from '@angular/forms';
import type { Observable } from 'rxjs';

export interface IErrorHandlerOptions {
  showToast?: boolean;
  formGroup?: FormGroup;
  customMessage?: string;
}

export interface IErrorService {
  handleError(error: unknown, options: IErrorHandlerOptions): Observable<never>;
}
