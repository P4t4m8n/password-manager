import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordSaltSessionService {
  #masterPasswordSalt = new BehaviorSubject<string | null>(null);

  get masterPasswordSalt$() {
    return this.#masterPasswordSalt.asObservable();
  }

  set masterPasswordSalt(salt: string | null) {
    this.#masterPasswordSalt.next(salt);
  }

  get currentSalt(): string | null {
    return this.#masterPasswordSalt.getValue();
  }

  checkSaltInitialized(): this is { currentSalt: string } {
    return this.currentSalt !== null;
  }
}
