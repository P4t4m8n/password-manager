import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, throwError } from 'rxjs';

import { ToastService } from '../toast/services/toast-service';
import { ErrorDialogService } from '../dialogs/error-dialog/services/error-dialog-service';

import { toastTypes } from '../toast/enum/toast-type.enum';

import type { IErrorHandlerOptions, IErrorService } from '../interfaces/error-service.interface';
import type { IHttpErrorResponseDto } from '../interfaces/http-error-response-dto';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements IErrorService {
  #toastService = inject(ToastService);
  #errorDialogService = inject(ErrorDialogService);

  #HTTP_ERROR_TITLES: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };

  handleError(error: unknown, options: IErrorHandlerOptions = {}): Observable<never> {
    const { showToast = true, customMessage } = options;

    if (error instanceof HttpErrorResponse) {
      return this.#handleHttpError({ error, ...options });
    }

    return this.#handleClientError({
      error,
      showToast,
      customMessage,
      showErrorDialog: options.showErrorDialog,
    });
  }

  #handleHttpError({
    error,
    showToast,
    formGroup,
    customMessage,
    showErrorDialog,
  }: IErrorHandlerOptions & { error: HttpErrorResponse }): Observable<never> {
    const appError: IHttpErrorResponseDto = error.error;

    if (error.status === 0) {
      const message = customMessage || 'Unable to connect to server. Please check your connection.';
      if (showToast) {
        this.#showErrorToast('Connection Error', message);
      }
      if (showErrorDialog) {
        this.#showErrorDialog(message);
      }

      return throwError(() => ({ message, statusCode: 0 }));
    }

    if (appError?.errors && formGroup) {
      this.#handleValidationErrors(appError.errors, formGroup);
    }

    if (showToast) {
      const title = this.#getErrorTitle(error.status);
      const message = customMessage || appError?.message || 'An error occurred';
      this.#showErrorToast(title, message);
    }

    if (showErrorDialog) {
      const message = customMessage || appError?.message || 'An error occurred';
      this.#showErrorDialog(message);
    }

    return throwError(() => appError);
  }

  #handleClientError({
    error,
    showToast,
    customMessage,
    showErrorDialog,
  }: IErrorHandlerOptions & { error: HttpErrorResponse | unknown }): Observable<never> {
    const message = customMessage || this.#extractErrorMessage(error);

    if (showToast) {
      this.#showErrorToast('Error', message);
    }

    if (showErrorDialog) {
      this.#showErrorDialog(message);
    }

    console.error('Client error:', error);

    return throwError(() => ({
      message,
      statusCode: -1,
      errors: undefined,
    }));
  }

  #handleValidationErrors(errors: Record<string, string | string[]>, formGroup: FormGroup): void {
    Object.keys(errors).forEach((fieldName) => {
      const errorValue = errors[fieldName];
      const message = Array.isArray(errorValue) ? errorValue[0] : errorValue;

      const control = formGroup.get(fieldName);
      if (control) {
        control.setErrors({ serverError: message });
        control.markAsTouched();
      }
    });
  }

  #showErrorToast(title: string, message: string): void {
    this.#toastService.initiate({
      title,
      content: message,
      type: toastTypes.error,
    });
  }

  #showErrorDialog(message: string): void {
    this.#errorDialogService.openDialog({
      message,
      backPath: '/',
      backButtonText: 'Go to Home',
    });
  }

  #getErrorTitle(statusCode: number): string {
    return this.#HTTP_ERROR_TITLES[statusCode] || 'Error';
  }

  #extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }
}
