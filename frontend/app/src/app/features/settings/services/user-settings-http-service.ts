import { Injectable } from '@angular/core';

import { catchError, Observable, retry, tap } from 'rxjs';

import { HttpService } from '../../../core/abstracts/http-service';

import type { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';
import type { IUserSettingsDTO, IUserSettingsEditDTO } from '../interfaces/IUserSettingsDTO';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsHttpService extends HttpService<IUserSettingsDTO> {
  constructor() {
    super('user-settings');
  }

  public get(): Observable<IHttpResponseDto<IUserSettingsDTO>> {
    return this.httpClient
      .get<IHttpResponseDto<IUserSettingsDTO>>(this.ENDPOINT, this.httpConfig)
      .pipe(
        tap(({ data }) => this.updateState(data)),
        catchError((err) => this.handleError(err, { showToast: true }))
      );
  }

  public save(dto: IUserSettingsEditDTO): Observable<IHttpResponseDto<IUserSettingsDTO>> {
    return (dto.id ? this.#update(dto) : this.#create(dto)).pipe(
      tap(({ data }) => this.updateState(data)),
      retry(1),
      catchError((err) => this.handleError(err, { showToast: false }))
    );
  }

  #create(dto: IUserSettingsEditDTO): Observable<IHttpResponseDto<IUserSettingsDTO>> {
    return this.httpClient.post<IHttpResponseDto<IUserSettingsDTO>>(
      this.ENDPOINT,
      dto,
      this.httpConfig
    );
  }

  #update(dto: IUserSettingsEditDTO): Observable<IHttpResponseDto<IUserSettingsDTO>> {
    return this.httpClient.patch<IHttpResponseDto<IUserSettingsDTO>>(
      `${this.ENDPOINT}/${dto.id}`,
      dto,
      this.httpConfig
    );
  }
}
