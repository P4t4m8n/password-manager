import { Directive, ElementRef, Output, EventEmitter, HostListener, inject } from '@angular/core';

@Directive()
export class DialogDirective {
  @Output() dialogClosed = new EventEmitter<void>();

  private el: ElementRef<HTMLElement> = inject(ElementRef);
  private dialogElement: HTMLDialogElement | null = null;

  ngAfterViewInit(): void {
    this.dialogElement = this.el.nativeElement.querySelector('dialog');
    if (!this.dialogElement) {
      throw new Error('A <dialog> element must be present in the component template.');
    }
    this.setupCloseListener();
  }

  @HostListener('click', ['$event'])
  onDialogClick(event: MouseEvent) {
    if ((event?.target as HTMLElement)?.nodeName === 'DIALOG') {
      this.close();
    }
  }

  open(): void {
    if (!this.dialogElement) {
      return;
    }

    if (this.dialogElement.open) {
      return;
    }
    this.dialogElement?.showModal();
  }

  close(): void {
    this.dialogElement?.close();
  }

  private setupCloseListener(): void {
    this.dialogElement?.addEventListener('close', () => {
      this.dialogClosed.emit();
    });
  }
}
