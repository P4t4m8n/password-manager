import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordSaltSessionService {
  private _masterPasswordSalt = new BehaviorSubject<string | null>(null);

  get masterPasswordSalt$() {
    return this._masterPasswordSalt.asObservable();
  }

  set masterPasswordSalt(salt: string | null) {
    this._masterPasswordSalt.next(salt);
  }

  get currentSalt(): string | null {
    return this._masterPasswordSalt.getValue();
  }

  checkSaltInitialized(): this is { currentSalt: string } {
    return this.currentSalt !== null;
  }
}
