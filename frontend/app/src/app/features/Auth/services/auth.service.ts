import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IAuthDto, IAuthResponseDto, IAuthSignInDto, IAuthSignUpDto } from '../interfaces/AuthDto';
import { CryptoService } from '../../crypto/services/crypto.service';

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
    return this.httpClient.post<IAuthResponseDto>(`${this.coreAPIUrl}/Sign-in`, dto).pipe(
      tap((res) => {
        console.log("🚀 ~ AuthService ~ signIn ~ res:", res)
        this.session_user$.next(res.user);
        this.masterPasswordSalt$.next(res.masterPasswordSalt);
      })
    );
  }

   signUp(dto: IAuthSignUpDto) {
    return this.httpClient.post<IAuthResponseDto>(`${this.coreAPIUrl}/Sign-up`, dto).pipe(
      tap((res) => {
        this.session_user$.next(res.user);
        this.masterPasswordSalt$.next(res.masterPasswordSalt);
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
    return this.httpClient.post<IAuthResponseDto>(`${this.coreAPIUrl}/Refresh-token`, {}).pipe(
      tap((res) => {
        this.session_user$.next(res.user);
        this.masterPasswordSalt$.next(res.masterPasswordSalt);
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
