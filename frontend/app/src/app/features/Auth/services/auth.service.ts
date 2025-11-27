import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CryptoService } from '../../crypto/services/crypto.service';
import type { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';

import type {
  IAuthDto,
  IAuthResponseDto,
  IAuthSignInDto,
  IAuthSignUpDto,
} from '../interfaces/AuthDto';
import { MasterPasswordSaltSessionService } from '../../master-password/services/master-password-salt-session-service';
import { ErrorService } from '../../../core/services/error-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient: HttpClient = inject(HttpClient);
  cryptoService = inject(CryptoService);
  masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);

  private coreAPIUrl = 'http://localhost:5222/api/auth';

  private _session_user = new BehaviorSubject<IAuthDto | null>(null);
  public session_user$ = this._session_user.asObservable();

  signIn(dto: IAuthSignInDto) {
    return this.httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Sign-in`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this._session_user.next(res.data.user);
          this.masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError(ErrorService.handleError)
      );
  }

  async signUp(dto: IAuthSignUpDto & { masterPassword: string }) {
    const { masterPassword, email, ...rest } = dto;

    const {
      recoveryKey,
      recoveryIVBase64,
      encryptedMasterKeyWithRecoveryBase64,
      masterPasswordSaltBase64,
    } = await this.cryptoService.handleMasterPasswordCreation(masterPassword);

    const signUpDto: IAuthSignUpDto = {
      ...rest,
      email,
      masterPasswordSalt: masterPasswordSaltBase64,
      encryptedMasterKeyWithRecovery: encryptedMasterKeyWithRecoveryBase64,
      recoveryIV: recoveryIVBase64,
    };

    return this.httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Sign-up`, signUpDto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this._session_user.next(res.data.user);
          this.masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
          this.cryptoService.downloadRecoveryKey(recoveryKey, email!);
        }),
        catchError(ErrorService.handleError)
      );
  }

  signOut() {
    return this.httpClient.post(`${this.coreAPIUrl}/Sign-out`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this._session_user.next(null);
        this.masterPasswordSaltSessionService.masterPasswordSalt = null;
        this.cryptoService.clearSensitiveData();
      }),
      catchError(ErrorService.handleError)
    );
  }

  refreshToken() {
    return this.httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Refresh-token`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this._session_user.next(res.data.user);
          this.masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError(ErrorService.handleError)
      );
  }

  checkSession() {
    return this.httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Check-session`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this._session_user.next(res.data.user);
          this.masterPasswordSaltSessionService.masterPasswordSalt = res.data.masterPasswordSalt;
        }),
        catchError((err) => {
          this._session_user.next(null);
          this.masterPasswordSaltSessionService.masterPasswordSalt = null;
          return of(null);
        }),
        catchError(ErrorService.handleError)
      );
  }

  get_session_user(): IAuthDto | null {
    return this._session_user.getValue();
  }

  get_master_password_salt(): string | null {
    return this.masterPasswordSaltSessionService.currentSalt;
  }
}
