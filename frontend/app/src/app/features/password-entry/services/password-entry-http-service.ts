import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, retry, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IPasswordEntryDto } from '../interfaces/passwordEntry';
import { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';

@Injectable({
  providedIn: 'root',
})
export class PasswordEntryHttpService {
  httpClient: HttpClient = inject(HttpClient);

  private coreAPIUrl = 'http://localhost:5222/api/Password-entry';

  private _passwordEntries$ = new BehaviorSubject<IPasswordEntryDto[]>([]);
  public passwordEntries$ = this._passwordEntries$.asObservable();

  public get(searchParams?: { entryName?: string }) {
    let params = new HttpParams();
    if (searchParams?.entryName) {
      params = params.set('EntryName', searchParams.entryName);
    }
    return this.httpClient
      .get<IHttpResponseDto<IPasswordEntryDto[]>>(`${this.coreAPIUrl}`, {
        withCredentials: true,
        params,
      })
      .pipe(
        tap((res) => {
          this._passwordEntries$.next(res.data);
        }),
        catchError((err) => {
          this._passwordEntries$.next([]);
          console.error('Error fetching password entries', err);
          throw err;
        })
      );
  }

  public getById(id: string) {
    return this.httpClient
      .get<IHttpResponseDto<IPasswordEntryDto>>(`${this.coreAPIUrl}/${id}`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          console.error(`Error fetching password entry with id ${id}`, err);
          throw err;
        })
      );
  }

  public save(dto: IPasswordEntryDto) {
    return dto.id ? this.update(dto) : this.create(dto);
  }

  public delete(id: string) {
    return this.httpClient
      .delete<void>(`${this.coreAPIUrl}/Delete/${id}`, { withCredentials: true })
      .pipe(
        tap(() => {
          const passwordEntities = this._passwordEntries$.value.filter((pe) => pe.id !== id);
          this._passwordEntries$.next(passwordEntities);
        }),
        catchError((err) => {
          console.error(`Error deleting password entry with id ${id}`, err);
          throw err;
        })
      );
  }

  private create(dto: IPasswordEntryDto) {
    return this.httpClient
      .post<IPasswordEntryDto>(`${this.coreAPIUrl}/Edit`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((pe) => {
          const passwordEntities = this._passwordEntries$.value;
          this._passwordEntries$.next([...passwordEntities, pe]);
          return pe;
        }),
        retry(1),
        catchError((err) => {
          console.error('Error creating password entry', err);
          throw err;
        })
      );
  }

  private update(dto: IPasswordEntryDto) {
    return this.httpClient
      .put<IPasswordEntryDto>(`${this.coreAPIUrl}/Edit/${dto.id}`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((updatedEntity) => {
          const passwordEntities = this._passwordEntries$.value.map((pe) =>
            pe.id === updatedEntity.id ? updatedEntity : pe
          );
          this._passwordEntries$.next(passwordEntities);
        }),
        retry(1),
        catchError((err) => {
          console.error('Error updating password entry', err);
          throw err;
        })
      );
  }
}
