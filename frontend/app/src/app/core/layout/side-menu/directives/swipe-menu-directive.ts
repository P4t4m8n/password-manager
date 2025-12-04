import { Directive, HostListener, inject } from '@angular/core';
import { SwipeMenuService } from '../services/swipe-menu-service';

@Directive({
  selector: '[appSwipeMenu]',
})
export class SwipeMenuDirective {
  #sideMenuService = inject(SwipeMenuService);
  #touchStartX = 0;
  readonly #minSwipeDistance = 50;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (event.changedTouches[0].screenX < 40) {
      this.#touchStartX = event.changedTouches[0].screenX;
    } else {
      this.#touchStartX = 0;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (this.#touchStartX === 0) return;

    const swipeDistance = event.changedTouches[0].screenX - this.#touchStartX;

    if (swipeDistance > this.#minSwipeDistance) {
      this.#sideMenuService.open();
    } else if (swipeDistance < -this.#minSwipeDistance) {
      this.#sideMenuService.close();
    }
  }
}
