import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { AbstractHttpService } from '../../../core/abstracts/http-service.abstract';

import type { IPasswordEntryDto, IPasswordEntryFilter } from '../interfaces/passwordEntry';
import type { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';

@Injectable({
  providedIn: 'root',
})
export class PasswordEntryHttpService extends AbstractHttpService<IPasswordEntryDto[]> {
  constructor() {
    super('password-entry');
  }

  public get(
    searchParams?: IPasswordEntryFilter
  ): Observable<IHttpResponseDto<IPasswordEntryDto[]>> {
    let params = new HttpParams();

    if (searchParams?.entryName) {
      params = params.set('EntryName', searchParams.entryName);
    }

    const settings = {
      ...this.httpConfig,
      params,
    };

    return this.httpClient
      .get<IHttpResponseDto<IPasswordEntryDto[]>>(`${this.ENDPOINT}`, settings)
      .pipe(
        tap((res) => {
          const demoData: IPasswordEntryDto[] = Array(30)
            .fill(null)
            .map((_, idx) => {
              return {
                ...res.data[0],
                id: `#${idx}`,
              };
            });
          this.updateState(demoData);
        }),
        catchError((err) => {
          this.updateState([]);
          return this.handleError(err, { showToast: true });
        })
      );
  }

  public getById(id: string): Observable<IPasswordEntryDto> {
    return this.httpClient
      .get<IHttpResponseDto<IPasswordEntryDto>>(`${this.ENDPOINT}/${id}`, this.httpConfig)
      .pipe(
        map((res) => res.data),
        catchError((err) => this.handleError(err, { showToast: true }))
      );
  }

  public save(dto: IPasswordEntryDto) {
    return dto.id ? this.#update(dto) : this.#create(dto);
  }

  public delete(id: string) {
    return this.httpClient.delete<void>(`${this.ENDPOINT}/${id}`, this.httpConfig).pipe(
      tap(() => {
        const passwordEntities = this.state$?.value?.filter((pe) => pe.id !== id) ?? [];
        this.updateState(passwordEntities);
      }),
      catchError((err) => this.handleError(err, { showToast: true }))
    );
  }

  public updateAfterRecovery(
    updatedEntries: IPasswordEntryDto[]
  ): Observable<IHttpResponseDto<IPasswordEntryDto[]>> {
    return this.httpClient
      .patch<IHttpResponseDto<IPasswordEntryDto[]>>(
        `${this.ENDPOINT}/update-after-recovery`,
        updatedEntries,
        this.httpConfig
      )
      .pipe(
        tap((res) => {
          this.updateState(res.data);
        }),
        catchError((err) => this.handleError(err, { showToast: true }))
      );
  }

  public likePasswordEntry(id: string): Observable<IHttpResponseDto<boolean>> {
    return this.httpClient
      .patch<IHttpResponseDto<boolean>>(`${this.ENDPOINT}/${id}/like`, {}, this.httpConfig)
      .pipe(
        tap((res) => {
          const passwordEntries = this.getState() ?? [];
          const idx = passwordEntries.findIndex((pe) => pe.id === id);
          passwordEntries[idx] = { ...passwordEntries[idx], isLiked: res.data };
          this.updateState([...passwordEntries]);
        }),
        catchError((err) => this.handleError(err, { showToast: true }))
      );
  }

  #create(dto: IPasswordEntryDto): Observable<IHttpResponseDto<IPasswordEntryDto>> {
    return this.httpClient
      .post<IHttpResponseDto<IPasswordEntryDto>>(`${this.ENDPOINT}`, dto, this.httpConfig)
      .pipe(
        tap((pe) => {
          this.#updatePasswordEntriesState(pe.data);
          return pe;
        }),
        retry(1),
        catchError((err) => this.handleError(err, { showToast: false }))
      );
  }

  #update(dto: IPasswordEntryDto): Observable<IHttpResponseDto<IPasswordEntryDto>> {
    return this.httpClient
      .patch<IHttpResponseDto<IPasswordEntryDto>>(
        `${this.ENDPOINT}/${dto.id}`,
        dto,
        this.httpConfig
      )
      .pipe(
        tap((updatedEntity) => {
          this.#updatePasswordEntriesState(updatedEntity.data);
        }),
        retry(1),
        catchError((err) => this.handleError(err, { showToast: false }))
      );
  }

  #updatePasswordEntriesState(passwordEntry: IPasswordEntryDto): void {
    const passwordEntries = this.getState() ?? [];
    const idx = passwordEntries.findIndex((pe) => pe.id === passwordEntry.id);

    if (idx >= 0) {
      passwordEntries[idx] = passwordEntry;
      this.updateState([...passwordEntries]);
    } else {
      this.updateState([...passwordEntries, passwordEntry]);
    }
  }
}
