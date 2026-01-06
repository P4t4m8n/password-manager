import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class MainLayoutRefService {
  #mainContent = new BehaviorSubject<ElementRef | null>(null);
  mainContent$ = this.#mainContent.asObservable();

  setMainContent(ref: ElementRef): void {
    this.#mainContent.next(ref);
  }

  getMainContent(): ElementRef | null {
    return this.#mainContent.getValue();
  }
}
