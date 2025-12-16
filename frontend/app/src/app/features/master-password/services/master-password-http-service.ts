import { inject, Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs';

import { AbstractHttpService } from '../../../core/abstracts/http-service.abstract';
import { MasterPasswordSaltSessionService } from './master-password-salt-session-service';

import type { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';
import type { IMasterKeyRecoveryEditDTO } from '../../user/interfaces/user-dto';
import type { Observable } from 'rxjs';
import type { IMasterPasswordRecoveryResponseDTO } from '../interfaces/master-password-recovery-response-dto';

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordHttpService extends AbstractHttpService<IMasterPasswordRecoveryResponseDTO> {
  #masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);

  constructor() {
    super('master-password-recovery');
  }

  public getMasterPasswordRecovery(): Observable<IMasterPasswordRecoveryResponseDTO> {
    return this.httpClient
      .get<IHttpResponseDto<IMasterPasswordRecoveryResponseDTO>>(this.ENDPOINT, this.httpConfig)
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          return this.handleError(err, { showToast: false });
        })
      );
  }

  public updateMasterPassword(
    dto: IMasterKeyRecoveryEditDTO
  ): Observable<IHttpResponseDto<string>> {
    return this.httpClient
      .patch<IHttpResponseDto<string>>(this.ENDPOINT, dto, this.httpConfig)
      .pipe(
        tap((res) => {
          if (!res.data) {
            throw new Error(
              'Master password update failed: received non-null salt - THIS SHOULD NOT HAPPEN!'
            );
          }
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data;
        }),
        catchError((err) => this.handleError(err, { showToast: false }))
      );
  }
}
