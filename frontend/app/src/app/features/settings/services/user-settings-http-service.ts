import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../core/consts/environment';
import { ErrorService } from '../../../core/services/error-service';
import { IUserSettingsDTO, IUserSettingsEditDTO } from '../interfaces/IUserSettingsDTO';
import { BehaviorSubject, catchError, retry, tap } from 'rxjs';
import { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsHttpService {
  #httpClient: HttpClient = inject(HttpClient);
  #CORE_API_URL = `${environment.apiUrl}/api/user-settings`;
  #errorService = inject(ErrorService);

  #userSettings$ = new BehaviorSubject<IUserSettingsDTO | null>(null);
  public userSettings$ = this.#userSettings$.asObservable();

  public get() {
    return this.#httpClient
      .get<IHttpResponseDto<IUserSettingsDTO>>(`${this.#CORE_API_URL}`, {
        withCredentials: true,
      })
      .pipe(
        tap(({ data }) => this.#userSettings$.next(data)),
        catchError((err) => this.#errorService.handleError(err, { showToast: true }))
      );
  }

  public save(dto: IUserSettingsEditDTO) {
    return (dto.id ? this.#update(dto) : this.#create(dto)).pipe(
      tap(({ data }) => this.#userSettings$.next(data)),
      retry(1),
      catchError((err) => this.#errorService.handleError(err, { showToast: false }))
    );
  }

  #create(dto: IUserSettingsEditDTO) {
    return this.#httpClient.post<IHttpResponseDto<IUserSettingsDTO>>(`${this.#CORE_API_URL}`, dto, {
      withCredentials: true,
    });
  }

  #update(dto: IUserSettingsEditDTO) {
    return this.#httpClient.patch<IHttpResponseDto<IUserSettingsDTO>>(
      `${this.#CORE_API_URL}/${dto.id}`,
      dto,
      {
        withCredentials: true,
      }
    );
  }
}
