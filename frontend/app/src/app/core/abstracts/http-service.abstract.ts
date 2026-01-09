import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { ErrorService } from '../services/error-service';

import { environment } from '../consts/environment.const';
import { AbstractGlobalStateService } from './abstract-global-state-service.abstract';

export abstract class AbstractHttpService<T> extends AbstractGlobalStateService<T> {
  protected readonly httpClient = inject(HttpClient);
  protected readonly errorService = inject(ErrorService);

  protected readonly ENDPOINT: string;
  protected readonly httpConfig = { withCredentials: true };

  constructor(endpoint: string) {
    super()
    this.ENDPOINT = `${environment.apiUrl}/${endpoint}`;
  }

  protected handleError(err: unknown, options: { showToast: boolean }): Observable<never> {
    return this.errorService.handleError(err, options);
  }


}
