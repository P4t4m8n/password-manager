import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SwipeMenuService {
  #isOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this.#isOpen.asObservable();

  toggle() {

    this.#isOpen.next(!this.#isOpen.value);
  }

  open() {
    this.#isOpen.next(true);
  }

  close() {
    this.#isOpen.next(false);
  }

  getValue() {
    return this.#isOpen.value;
  }
}
