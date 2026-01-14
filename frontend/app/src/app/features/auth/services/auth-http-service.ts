import { inject, Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, switchMap, tap } from 'rxjs';

import { AbstractHttpService } from '../../../core/abstracts/http-service.abstract';
import { CryptoService } from '../../crypto/services/crypto-service';
import { MasterPasswordSaltSessionService } from '../../master-password/services/master-password-salt-session-service';
import { UserSettingsStateService } from '../../settings/services/user-settings-state-service';

import type {
  IAuthProps,
  IAuthResponseDto,
  IAuthSignInDto,
  IAuthSignUpDto,
} from '../interfaces/auth.interface';
import type { TPrettify } from '../../../core/types/prettify.type';
import type { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';
import type { IUserDTO } from '../../user/interfaces/user-dto';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService extends AbstractHttpService<IUserDTO> {
  #cryptoService = inject(CryptoService);
  #masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);
  #userSettingsStateService = inject(UserSettingsStateService);

  constructor() {
    super('auth');
  }

  signIn(
    dto: TPrettify<IAuthProps<IAuthSignInDto>>
  ): Observable<IHttpResponseDto<IAuthResponseDto>> {
    return this.httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.ENDPOINT}/Sign-in`, dto, this.httpConfig)
      .pipe(
        tap((res) => {
          this.#updateStatesData(res, dto.masterPassword);
        })
        //Error handling is done in the component to allow formGroup error setting
      );
  }

  signUp(
    dto: TPrettify<IAuthProps<IAuthSignUpDto>>
  ): Observable<IHttpResponseDto<IAuthResponseDto> & { recoveryKey: Uint8Array }> {
    const { masterPassword, email, ...rest } = dto;

    return from(this.#cryptoService.handleMasterPasswordCreation(masterPassword)).pipe(
      switchMap(
        ({ recoveryKey, recoveryIV, encryptedMasterKeyWithRecovery, masterPasswordSalt }) => {
          const signUpDto: IAuthSignUpDto = {
            ...rest,
            email,
            masterPasswordSalt,
            encryptedMasterKeyWithRecovery,
            recoveryIV,
          };

          return this.httpClient
            .post<IHttpResponseDto<IAuthResponseDto>>(
              `${this.ENDPOINT}/Sign-up`,
              signUpDto,
              this.httpConfig
            )
            .pipe(
              tap((res) => {
                this.#updateStatesData(res, masterPassword);
              }),
              map((res) => ({ ...res, recoveryKey }))
            );
        }
      )
    );
  }

  signOut(): Observable<Object> {
    return this.httpClient.post(`${this.ENDPOINT}/Sign-out`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.updateState(null);
        this.#masterPasswordSaltSessionService.masterPasswordSalt = null;
        this.#userSettingsStateService.updateState(null);
        this.#cryptoService.clearSensitiveData();
      }),
      catchError((err) => this.handleError(err, { showToast: true }))
    );
  }

  refreshToken(): Observable<IHttpResponseDto<IAuthResponseDto>> {
    return this.httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.ENDPOINT}/Refresh-token`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.#updateStatesData(res);
        }),
        catchError((err) => this.handleError(err, { showToast: true }))
      );
  }

  checkSession(): Observable<IHttpResponseDto<IAuthResponseDto> | null> {
    return this.httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.ENDPOINT}/Check-session`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.#updateStatesData(res);
        }),
        catchError(() => {
          this.updateState(null);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = null;
          return of(null);
        })
      );
  }

  get_session_user(): IUserDTO | null {
    return this.getState();
  }

  #updateStatesData(res: IHttpResponseDto<IAuthResponseDto>, masterPassword?: string): void {
    const { masterPasswordSalt, user } = res.data;
    this.updateState(user);
    this.#userSettingsStateService.updateState(user?.settings ?? null);
    this.#masterPasswordSaltSessionService.masterPasswordSalt = masterPasswordSalt;
    this.#cryptoService.persistMasterPassword(masterPassword);
  }
}
