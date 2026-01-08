import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AbstractGlobalStateService } from '../abstracts/abstract-global-state-service.abstract';

@Injectable({
  providedIn: 'root',
})
export class MainLayoutRefService extends AbstractGlobalStateService<ElementRef | null> {
  setMainContent(ref: ElementRef): void {
    this.updateState(ref);
  }

  getMainContent(): ElementRef | null {
    return this.getState();
  }
}
