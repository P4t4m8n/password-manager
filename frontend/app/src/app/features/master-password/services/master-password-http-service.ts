import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs';

import { MasterPasswordSaltSessionService } from './master-password-salt-session-service';
import { ErrorService } from '../../../core/services/error-service';

import { environment } from '../../../core/consts/environment';

import type { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';
import type { IMasterKeyRecoveryEditDTO } from '../../user/interfaces/user-dto';
import type { Observable } from 'rxjs';
import type { IMasterPasswordRecoveryResponseDTO } from '../interfaces/master-password-recovery-response-dto';

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordHttpService {
  #errorService = inject(ErrorService);
  #httpClient = inject(HttpClient);
  #masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);

  #CORE_API_URL = `${environment.apiUrl}/master-password-recovery`;

  public getMasterPasswordRecovery(): Observable<IMasterPasswordRecoveryResponseDTO> {
    return this.#httpClient
      .get<IHttpResponseDto<IMasterPasswordRecoveryResponseDTO>>(this.#CORE_API_URL, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          return this.#errorService.handleError(err, { showToast: false });
        })
      );
  }

  public updateMasterPassword(
    dto: IMasterKeyRecoveryEditDTO
  ): Observable<IHttpResponseDto<string>> {
    return this.#httpClient
      .patch<IHttpResponseDto<string>>(this.#CORE_API_URL, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          if (!res.data) {
            throw new Error(
              'Master password update failed: received non-null salt - THIS SHOULD NOT HAPPEN!'
            );
          }
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data;
        }),
        catchError((err) => this.#errorService.handleError(err, { showToast: false }))
      );
  }
}
