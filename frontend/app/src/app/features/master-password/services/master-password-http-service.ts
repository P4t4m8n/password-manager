import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs';

import type { Observable } from 'rxjs';
import type { IMasterPasswordRecoveryResponseDTO } from '../interfaces/masterPasswordRecoveryResponseDTO';
import { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';
import { IMasterKeyRecoveryEditDTO } from '../../user/interfaces/UserDTO';
import { MasterPasswordSaltSessionService } from './master-password-salt-session-service';
import { ErrorService } from '../../../core/services/error-service';

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordHttpService {
  private httpClient = inject(HttpClient);
  private coreAPIUrl = 'http://localhost:5222/api/master-password-recovery';

  private _masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);

  public getMasterPasswordRecovery(): Observable<IMasterPasswordRecoveryResponseDTO> {
    return this.httpClient
      .get<IHttpResponseDto<IMasterPasswordRecoveryResponseDTO>>(this.coreAPIUrl, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          console.error(`Error fetching master password recovery data`, err);
          throw err;
        })
      );
  }

  public updateMasterPassword(
    dto: IMasterKeyRecoveryEditDTO
  ): Observable<IHttpResponseDto<string>> {
    return this.httpClient
      .patch<IHttpResponseDto<string>>(this.coreAPIUrl, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          if (!res.data) {
            throw new Error(
              'Master password update failed: received non-null salt - THIS SHOULD NOT HAPPEN!'
            );
          }
          this._masterPasswordSaltSessionService.masterPasswordSalt = res.data;
        }),
        catchError(ErrorService.handleError)
      );
  }
}
