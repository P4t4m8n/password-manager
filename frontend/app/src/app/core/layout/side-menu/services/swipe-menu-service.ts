import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SwipeMenuService {
  #isOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this.#isOpen.asObservable();

  toggle() {

    this.#isOpen.next(false);
  }

  open() {
    this.#isOpen.next(false);
  }

  close() {
    this.#isOpen.next(false);
  }

  getValue() {
    return this.#isOpen.value;
  }
}
