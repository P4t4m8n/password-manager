import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IHttpErrorResponseDto } from '../interfaces/http-error-response-dto';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  static handleError(err: HttpErrorResponse): Observable<never> {
    const appError: IHttpErrorResponseDto = err.error;
    return throwError(() => appError);
  }
}
