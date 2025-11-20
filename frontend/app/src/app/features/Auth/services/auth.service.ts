import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IAuthDto, IAuthResponseDto, IAuthSignInDto, IAuthSignUpDto } from '../interfaces/AuthDto';
import { CryptoService } from '../../crypto/services/crypto.service';
import { IHttpResponseDto } from '../../../core/interfaces/http-response-dto';

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
        })
      );
  }

  signUp(dto: IAuthSignUpDto) {
    return this.httpClient
      .post<IHttpResponseDto<IAuthResponseDto>>(`${this.coreAPIUrl}/Sign-up`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.session_user$.next(res.data.user);
          this.masterPasswordSalt$.next(res.data.masterPasswordSalt);
        })
      );
  }

  signOut() {
    return this.httpClient.post(`${this.coreAPIUrl}/Sign-out`, {}).pipe(
      tap(() => {
        this.session_user$.next(null);
        this.masterPasswordSalt$.next(null);
        this.cryptoService.clearSensitiveData();
      })
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
        })
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
        })
      );
  }

  get_session_user(): IAuthDto | null {
    return this.session_user$.getValue();
  }

  get_master_password_salt(): string | null {
    return this.masterPasswordSalt$.getValue();
  }
}
