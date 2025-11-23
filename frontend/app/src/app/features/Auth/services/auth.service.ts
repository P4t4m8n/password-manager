import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IAuthDto, IAuthResponseDto, IAuthSignInDto, IAuthSignUpDto } from '../interfaces/AuthDto';
import { CryptoService } from '../../crypto/services/crypto.service';
import { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';
import { IHttpErrorResponseDto } from '../../../core/interfaces/http-error-response-dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient: HttpClient = inject(HttpClient);
  cryptoService = inject(CryptoService);
  private coreAPIUrl = 'http://localhost:5222/api/auth';
  private session_user$ = new BehaviorSubject<IAuthDto | null>(null);
  public _session_user$ = this.session_user$.asObservable();

  private masterPasswordSalt$ = new BehaviorSubject<string | null>(null);
  public _masterPasswordSalt$ = this.masterPasswordSalt$.asObservable();

  signIn(dto: IAuthSignInDto) {
    return this.httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Sign-in`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.session_user$.next(res.data.user);
          this.masterPasswordSalt$.next(res.data.masterPasswordSalt);
        }),
        catchError(this._handleError)
      );
  }

  async signUp(dto: IAuthSignUpDto & { masterPassword: string }) {
    const { masterPassword, email, ...rest } = dto;

    // Generate crypto materials
    const masterPasswordSalt = this.cryptoService.generateSalt();
    await this.cryptoService.deriveMasterEncryptionKey({
      masterPassword,
      salt: masterPasswordSalt,
    });

    const recoveryKey = this.cryptoService.generateRecoveryKey();
    const { encrypted: encryptedMasterKeyWithRecovery, iv: recoveryIV } =
      await this.cryptoService.encryptMasterKeyWithRecovery(recoveryKey);

    // Convert to base64
    const masterPasswordSaltBase64 = this.cryptoService.arrayBufferToBase64(masterPasswordSalt);
    const encryptedMasterKeyWithRecoveryBase64 = this.cryptoService.arrayBufferToBase64(
      encryptedMasterKeyWithRecovery
    );
    const recoveryIVBase64 = this.cryptoService.arrayBufferToBase64(recoveryIV);

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
          this.session_user$.next(res.data.user);
          this.masterPasswordSalt$.next(res.data.masterPasswordSalt);
          this.cryptoService.downloadRecoveryKey(recoveryKey, email!);
        }),
        catchError(this._handleError)
      );
  }

  signOut() {
    return this.httpClient.post(`${this.coreAPIUrl}/Sign-out`, {}).pipe(
      tap(() => {
        this.session_user$.next(null);
        this.masterPasswordSalt$.next(null);
        this.cryptoService.clearSensitiveData();
      }),
      catchError(this._handleError)
    );
  }

  refreshToken() {
    return this.httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Refresh-token`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.session_user$.next(res.data.user);
          this.masterPasswordSalt$.next(res.data.masterPasswordSalt);
        }),
        catchError(this._handleError)
      );
  }

  checkSession() {
    return this.httpClient
      .get<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Check-session`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.session_user$.next(res.data.user);
          this.masterPasswordSalt$.next(res.data.masterPasswordSalt);
        }),
        catchError((err) => {
          this.session_user$.next(null);
          this.masterPasswordSalt$.next(null);
          return of(null);
        }),
        catchError(this._handleError)
      );
  }

  get_session_user(): IAuthDto | null {
    return this.session_user$.getValue();
  }

  get_master_password_salt(): string | null {
    return this.masterPasswordSalt$.getValue();
  }

  private _handleError(err: HttpErrorResponse) {
    const appError: IHttpErrorResponseDto = err.error;
    return throwError(() => appError);
  }
}
