import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  Renderer2,
  inject,
} from '@angular/core';

@Directive({
  selector: '[menu]',
})
export class MenuDirective implements OnInit {
  @Output() clickOutside = new EventEmitter();
  #el = inject(ElementRef);
  #renderer = inject(Renderer2);

  ngOnInit(): void {
    setTimeout(() => {
      this.onClick = (ev: MouseEvent) => {
        const isClickedInside = this.#el.nativeElement.contains(ev.target);
        if (!isClickedInside) this.clickOutside.emit();
      };
    }, 0);
  }

  ngAfterViewInit(): void {
    this.#adjustPosition();
  }

  #adjustPosition() {
    const element = this.#el.nativeElement;

    this.#renderer.removeStyle(element, 'top');
    this.#renderer.removeStyle(element, 'bottom');

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.bottom > viewportHeight) {
      this.#renderer.setStyle(element, 'top', 'auto');
      this.#renderer.setStyle(element, 'bottom', '100%');
    }
  }

  @HostListener('document:click', ['$event'])
  onClick: (ev: MouseEvent) => void = () => {};

  @HostListener('window:resize')
  onResize() {
    this.#adjustPosition();
  }
}
