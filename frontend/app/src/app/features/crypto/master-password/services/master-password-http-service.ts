import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IMasterPasswordRecoveryResponseDTO } from '../../interfaces/masterPasswordRecoveryResponseDTO';
import { catchError, map, Observable } from 'rxjs';
import id from '@angular/common/locales/extra/id';
import { IHttpResponseDto } from '../../../../core/interfaces/http-response-dto';

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordHttpService {
  private httpClient: HttpClient = inject(HttpClient);
  private coreAPIUrl = 'http://localhost:5222/api/User';

  public getMasterPasswordRecovery(): Observable<IMasterPasswordRecoveryResponseDTO> {
    return this.httpClient
      .get<IHttpResponseDto<IMasterPasswordRecoveryResponseDTO>>(
        `${this.coreAPIUrl}/master-password-recovery`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          console.error(`Error fetching password entry with id ${id}`, err);
          throw err;
        })
      );
  }
}
