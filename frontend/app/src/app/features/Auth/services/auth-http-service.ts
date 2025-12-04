import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';

import { CryptoService } from '../../crypto/services/crypto.service';
import { MasterPasswordSaltSessionService } from '../../master-password/services/master-password-salt-session-service';
import { ErrorService } from '../../../core/services/error-service';

import { environment } from '../../../core/consts/environment';

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
export class AuthHttpService {
  #httpClient: HttpClient = inject(HttpClient);
  #cryptoService = inject(CryptoService);
  #masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);
  #errorService = inject(ErrorService);

  #CORE_API_URL = `${environment.apiUrl}/auth`;

  #session_user = new BehaviorSubject<IAuthDto | null>(null);
  public session_user$ = this.#session_user.asObservable();

  signIn(dto: IAuthSignInDto) {
    return this.#httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.#CORE_API_URL}/Sign-in`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.#session_user.next(res.data.user);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError((err) => this.#errorService.handleError(err, { showToast: false }))
      );
  }

  async signUp(dto: TPrettify<IAuthSignUpDto & { masterPassword: string }>) {
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

    return this.#httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.#CORE_API_URL}/Sign-up`, signUpDto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.#session_user.next(res.data.user);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
          this.#cryptoService.downloadRecoveryKey(recoveryKey, email!);
        }),
        catchError((err) => this.#errorService.handleError(err, { showToast: false }))
      );
  }

  signOut() {
    return this.#httpClient
      .post(`${this.#CORE_API_URL}/Sign-out`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.#session_user.next(null);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = null;
          this.#cryptoService.clearSensitiveData();
        }),
        catchError((err) => this.#errorService.handleError(err, { showToast: true }))
      );
  }

  refreshToken() {
    const x = this.#httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.#CORE_API_URL}/Refresh-token`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.#session_user.next(res.data.user);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError((err) => this.#errorService.handleError(err, { showToast: true }))
      );
  }

  checkSession() {
    return this.#httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.#CORE_API_URL}/Check-session`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.#session_user.next(res.data.user);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError(() => {
          this.#session_user.next(null);
          this.#masterPasswordSaltSessionService.masterPasswordSalt = null;
          return of(null);
        })
      );
  }

  get_session_user(): IAuthDto | null {
    return this.#session_user.getValue();
  }
}
