import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { ErrorService } from '../services/error-service';

import { environment } from '../consts/environment.const';

export abstract class HttpService<T> {
  protected readonly httpClient = inject(HttpClient);
  protected readonly errorService = inject(ErrorService);

  protected readonly ENDPOINT: string;
  protected readonly httpConfig = { withCredentials: true };

  protected state$ = new BehaviorSubject<T | null>(null);
  public readonly data$ = this.state$.asObservable();

  constructor(endpoint: string) {
    this.ENDPOINT = `${environment.apiUrl}/${endpoint}`;
  }

  protected handleError(err: unknown, options: { showToast: boolean }): Observable<never> {
    return this.errorService.handleError(err, options);
  }

  protected updateState(data: T | null): void {
    this.state$.next(data);
  }

  protected getState(): T | null {
    return this.state$.getValue();
  }
}
