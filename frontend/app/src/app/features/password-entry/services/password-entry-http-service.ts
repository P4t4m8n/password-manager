import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, retry, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ErrorService } from '../../../core/services/error-service';

import { environment } from '../../../core/consts/environment';

import type { IPasswordEntryDto } from '../interfaces/passwordEntry';
import type { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';

@Injectable({
  providedIn: 'root',
})
export class PasswordEntryHttpService {
  #httpClient: HttpClient = inject(HttpClient);
  #errorService: ErrorService = inject(ErrorService);

  #CORE_API_URL = `${environment.apiUrl}/Password-entry`;

  #passwordEntries$ = new BehaviorSubject<IPasswordEntryDto[]>([]);
  public passwordEntries$ = this.#passwordEntries$.asObservable();

  public get(searchParams?: { entryName?: string }) {
    let params = new HttpParams();
    if (searchParams?.entryName) {
      params = params.set('EntryName', searchParams.entryName);
    }
    return this.#httpClient
      .get<IHttpResponseDto<IPasswordEntryDto[]>>(`${this.#CORE_API_URL}`, {
        withCredentials: true,
        params,
      })
      .pipe(
        tap((res) => {
          this.#passwordEntries$.next(res.data);
        }),
        catchError((err) => {
          this.#passwordEntries$.next([]);
          return this.#errorService.handleError(err, { showToast: true });
        })
      );
  }

  public getById(id: string) {
    return this.#httpClient
      .get<IHttpResponseDto<IPasswordEntryDto>>(`${this.#CORE_API_URL}/${id}`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        catchError((err) => this.#errorService.handleError(err, { showToast: true }))
      );
  }

  public save(dto: IPasswordEntryDto) {
    return dto.id ? this.#update(dto) : this.#create(dto);
  }

  public delete(id: string) {
    return this.#httpClient
      .delete<void>(`${this.#CORE_API_URL}/${id}`, { withCredentials: true })
      .pipe(
        tap(() => {
          const passwordEntities = this.#passwordEntries$.value.filter((pe) => pe.id !== id);
          this.#passwordEntries$.next(passwordEntities);
        }),
        catchError((err) => this.#errorService.handleError(err, { showToast: true }))
      );
  }

  public updateAfterRecovery(
    updatedEntries: IPasswordEntryDto[]
  ): Observable<IHttpResponseDto<IPasswordEntryDto[]>> {
    return this.#httpClient
      .patch<IHttpResponseDto<IPasswordEntryDto[]>>(
        `${this.#CORE_API_URL}/update-after-recovery`,
        updatedEntries,
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.#passwordEntries$.next(res.data);
        }),
        catchError((err) => this.#errorService.handleError(err, { showToast: true }))
      );
  }

  #create(dto: IPasswordEntryDto) {
    return this.#httpClient
      .post<IHttpResponseDto<IPasswordEntryDto>>(`${this.#CORE_API_URL}`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((pe) => {
          const passwordEntities = this.#passwordEntries$.value;
          this.#passwordEntries$.next([...passwordEntities, pe.data]);
          return pe;
        }),
        retry(1),
        catchError((err) => this.#errorService.handleError(err, { showToast: false }))
      );
  }

  #update(dto: IPasswordEntryDto) {
    return this.#httpClient
      .patch<IHttpResponseDto<IPasswordEntryDto>>(`${this.#CORE_API_URL}/${dto.id}`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((updatedEntity) => {
          const passwordEntities = this.#passwordEntries$.value.map((pe) =>
            pe.id === updatedEntity.data.id ? updatedEntity.data : pe
          );
          this.#passwordEntries$.next(passwordEntities);
        }),
        retry(1),
        catchError((err) => this.#errorService.handleError(err, { showToast: false }))
      );
  }
}
