import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, retry, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IPasswordEntryDto } from '../interfaces/passwordEntry';
import { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';
import { ErrorService } from '../../../core/services/error-service';

@Injectable({
  providedIn: 'root',
})
export class PasswordEntryHttpService {
  private _httpClient: HttpClient = inject(HttpClient);
  private _errorService: ErrorService = inject(ErrorService);

  private _coreAPIUrl = 'http://localhost:5222/api/Password-entry';

  private _passwordEntries$ = new BehaviorSubject<IPasswordEntryDto[]>([]);
  public passwordEntries$ = this._passwordEntries$.asObservable();

  public get(searchParams?: { entryName?: string }) {
    let params = new HttpParams();
    if (searchParams?.entryName) {
      params = params.set('EntryName', searchParams.entryName);
    }
    return this._httpClient
      .get<IHttpResponseDto<IPasswordEntryDto[]>>(`${this._coreAPIUrl}`, {
        withCredentials: true,
        params,
      })
      .pipe(
        tap((res) => {
          this._passwordEntries$.next(res.data);
        }),
        catchError((err) => {
          this._passwordEntries$.next([]);
          return this._errorService.handleError(err, { showToast: true });
        })
      );
  }

  public getById(id: string) {
    return this._httpClient
      .get<IHttpResponseDto<IPasswordEntryDto>>(`${this._coreAPIUrl}/${id}`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        catchError((err) => this._errorService.handleError(err, { showToast: true }))
      );
  }

  public save(dto: IPasswordEntryDto) {
    return dto.id ? this._update(dto) : this._create(dto);
  }

  public delete(id: string) {
    return this._httpClient
      .delete<void>(`${this._coreAPIUrl}/${id}`, { withCredentials: true })
      .pipe(
        tap(() => {
          const passwordEntities = this._passwordEntries$.value.filter((pe) => pe.id !== id);
          this._passwordEntries$.next(passwordEntities);
        }),
        catchError((err) => this._errorService.handleError(err, { showToast: true }))
      );
  }

  public updateAfterRecovery(
    updatedEntries: IPasswordEntryDto[]
  ): Observable<IHttpResponseDto<IPasswordEntryDto[]>> {
    return this._httpClient
      .patch<IHttpResponseDto<IPasswordEntryDto[]>>(
        `${this._coreAPIUrl}/update-after-recovery`,
        updatedEntries,
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this._passwordEntries$.next(res.data);
        }),
        catchError((err) => this._errorService.handleError(err, { showToast: true }))
      );
  }

  private _create(dto: IPasswordEntryDto) {
    return this._httpClient
      .post<IHttpResponseDto<IPasswordEntryDto>>(`${this._coreAPIUrl}`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((pe) => {
          const passwordEntities = this._passwordEntries$.value;
          this._passwordEntries$.next([...passwordEntities, pe.data]);
          return pe;
        }),
        retry(1),
        catchError((err) => this._errorService.handleError(err, { showToast: false }))
      );
  }

  private _update(dto: IPasswordEntryDto) {
    return this._httpClient
      .patch<IHttpResponseDto<IPasswordEntryDto>>(`${this._coreAPIUrl}/${dto.id}`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((updatedEntity) => {
          const passwordEntities = this._passwordEntries$.value.map((pe) =>
            pe.id === updatedEntity.data.id ? updatedEntity.data : pe
          );
          this._passwordEntries$.next(passwordEntities);
        }),
        retry(1),
        catchError((err) => this._errorService.handleError(err, { showToast: false }))
      );
  }
}
