import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IHttpErrorResponseDto } from '../interfaces/http-error-response-dto';
import { Observable, throwError } from 'rxjs';
import { IErrorHandlerOptions, IErrorService } from '../interfaces/error-service.interface';
import { FormGroup } from '@angular/forms';
import { toastTypes } from '../toast/interface/toastData';
import { ToastService } from '../toast/services/toast-service';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements IErrorService {
  private toastService = inject(ToastService);

  private readonly HTTP_ERROR_TITLES: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };

  handleError(error: unknown, options: IErrorHandlerOptions = {}): Observable<never> {
    const { showToast = true, formGroup, customMessage } = options;

    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error, showToast, formGroup, customMessage);
    }

    return this.handleClientError(error, showToast, customMessage);
  }

  private handleHttpError(
    error: HttpErrorResponse,
    showToast: boolean,
    formGroup?: FormGroup,
    customMessage?: string
  ): Observable<never> {
    const appError: IHttpErrorResponseDto = error.error;

    if (error.status === 0) {
      const message = customMessage || 'Unable to connect to server. Please check your connection.';
      if (showToast) {
        this.showErrorToast('Connection Error', message);
      }
      return throwError(() => ({ message, statusCode: 0 }));
    }

    if (appError?.errors && formGroup) {
      this.handleValidationErrors(appError.errors, formGroup);
    }

    if (showToast) {
      const title = this.getErrorTitle(error.status);
      const message = customMessage || appError?.message || 'An error occurred';
      this.showErrorToast(title, message);
    }

    return throwError(() => appError);
  }

  private handleClientError(
    error: unknown,
    showToast: boolean,
    customMessage?: string
  ): Observable<never> {
    const message = customMessage || this.extractErrorMessage(error);

    if (showToast) {
      this.showErrorToast('Error', message);
    }

    console.error('Client error:', error);

    return throwError(() => ({
      message,
      statusCode: -1,
      errors: undefined,
    }));
  }

  private handleValidationErrors(
    errors: Record<string, string | string[]>,
    formGroup: FormGroup
  ): void {
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

  private showErrorToast(title: string, message: string): void {
    this.toastService.initiate({
      title,
      content: message,
      type: toastTypes.error,
    });
  }

  private getErrorTitle(statusCode: number): string {
    return this.HTTP_ERROR_TITLES[statusCode] || 'Error';
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }
}
