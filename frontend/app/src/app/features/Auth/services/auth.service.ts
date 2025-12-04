import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { CryptoService } from '../../crypto/services/crypto.service';
import { MasterPasswordSaltSessionService } from '../../master-password/services/master-password-salt-session-service';
import { ErrorService } from '../../../core/services/error-service';

import type {
  IAuthDto,
  IAuthResponseDto,
  IAuthSignInDto,
  IAuthSignUpDto,
} from '../interfaces/AuthDto';
import type { TPrettify } from '../../../core/types/prettify.type';
import type { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _httpClient: HttpClient = inject(HttpClient);
  private _cryptoService = inject(CryptoService);
  private _masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);
  private _errorService = inject(ErrorService);

  private coreAPIUrl = 'http://localhost:5222/api/auth';

  private _session_user = new BehaviorSubject<IAuthDto | null>(null);
  public session_user$ = this._session_user.asObservable();

  signIn(dto: IAuthSignInDto) {
    return this._httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Sign-in`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this._session_user.next(res.data.user);
          this._masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError((err) => this._errorService.handleError(err, { showToast: false }))
      );
  }

  async signUp(dto: TPrettify<IAuthSignUpDto & { masterPassword: string }>) {
    const { masterPassword, email, ...rest } = dto;

    const { recoveryKey, recoveryIV, encryptedMasterKeyWithRecovery, masterPasswordSalt } =
      await this._cryptoService.handleMasterPasswordCreation(masterPassword);

    const signUpDto: IAuthSignUpDto = {
      ...rest,
      email,
      masterPasswordSalt,
      encryptedMasterKeyWithRecovery,
      recoveryIV,
    };

    return this._httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Sign-up`, signUpDto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this._session_user.next(res.data.user);
          this._masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
          this._cryptoService.downloadRecoveryKey(recoveryKey, email!);
        }),
        catchError((err) => this._errorService.handleError(err, { showToast: false }))
      );
  }

  signOut() {
    return this._httpClient.post(`${this.coreAPIUrl}/Sign-out`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this._session_user.next(null);
        this._masterPasswordSaltSessionService.masterPasswordSalt = null;
        this._cryptoService.clearSensitiveData();
      }),
      catchError((err) => this._errorService.handleError(err, { showToast: true }))
    );
  }

  refreshToken() {
    const x = this._httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Refresh-token`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this._session_user.next(res.data.user);
          this._masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError((err) => this._errorService.handleError(err, { showToast: true }))
      );
  }

  checkSession() {
    return this._httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Check-session`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this._session_user.next(res.data.user);
          this._masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError(() => {
          this._session_user.next(null);
          this._masterPasswordSaltSessionService.masterPasswordSalt = null;
          return of(null);
        })
      );
  }

  get_session_user(): IAuthDto | null {
    return this._session_user.getValue();
  }
}
