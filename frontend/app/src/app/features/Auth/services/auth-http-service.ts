import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

import { HttpService } from '../../../core/abstracts/http-service';
import { CryptoService } from '../../crypto/services/crypto.service';
import { MasterPasswordSaltSessionService } from '../../master-password/services/master-password-salt-session-service';

import type {
  IAuthDto,
  IAuthResponseDto,
  IAuthSignInDto,
  IAuthSignUpDto,
} from '../interfaces/auth.interface';
import type { TPrettify } from '../../../core/types/prettify.type';
import type { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService extends HttpService<IAuthDto> {
  #cryptoService = inject(CryptoService);
  #masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);

  constructor() {
    super('auth');
  }

  signIn(dto: IAuthSignInDto): Observable<IHttpResponseDto<IAuthResponseDto>> {
    return this.httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.ENDPOINT}/Sign-in`, dto, this.httpConfig)
      .pipe(
        tap((res) => {
          this.updateState(res.data.user);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError((err) => this.handleError(err, { showToast: false }))
      );
  }

  async signUp(
    dto: TPrettify<IAuthSignUpDto & { masterPassword: string }>
  ): Promise<Observable<IHttpResponseDto<IAuthResponseDto>>> {
    const { masterPassword, email, ...rest } = dto;

    const { recoveryKey, recoveryIV, encryptedMasterKeyWithRecovery, masterPasswordSalt } =
      await this.#cryptoService.handleMasterPasswordCreation(masterPassword);

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
          this.updateState(res.data.user);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
          this.#cryptoService.downloadRecoveryKey(recoveryKey, email!);
        }),
        catchError((err) => this.handleError(err, { showToast: false }))
      );
  }

  signOut(): Observable<Object> {
    return this.httpClient.post(`${this.ENDPOINT}/Sign-out`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.updateState(null);
        this.#masterPasswordSaltSessionService.masterPasswordSalt = null;
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
          this.updateState(res.data.user);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
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
          this.updateState(res.data.user);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError(() => {
          this.updateState(null);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = null;
          return of(null);
        })
      );
  }

  get_session_user(): IAuthDto | null {
    return this.getState();
  }
}
