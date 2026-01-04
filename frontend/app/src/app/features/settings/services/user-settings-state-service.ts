import { inject, Injectable } from '@angular/core';
import { AbstractGlobalStateService } from '../../../core/abstracts/abstract-global-state-service.abstract';
import { IUserSettingsDTO } from '../interfaces/IUserSettingsDTO';
import { CryptoService } from '../../crypto/services/crypto.service';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsStateService extends AbstractGlobalStateService<IUserSettingsDTO> {
  public override updateState(data: IUserSettingsDTO | null): void {

    super.updateState(data);
  }

  public getCurrentState(): IUserSettingsDTO | null {
    return this.getState();
  }
}
