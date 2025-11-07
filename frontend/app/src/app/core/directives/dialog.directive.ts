import { Directive, ElementRef, OnInit, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appDialog]',
  standalone: true,
})
export class DialogDirective implements OnInit {
  @Output() dialogClosed = new EventEmitter<void>();

  private dialogElement: HTMLDialogElement;

  constructor(private el: ElementRef<HTMLDialogElement>) {
    this.dialogElement = this.el.nativeElement;
  }

  ngOnInit(): void {
    this.setupCloseListener();
  }

  @HostListener('click', ['$event'])
  onDialogClick(event: MouseEvent) {
    if ((event?.target as HTMLElement)?.nodeName === 'DIALOG') {
      this.close();
    }
  }

  open(): void {
    this.dialogElement.showModal();
  }

  close(): void {
    this.dialogElement.close();
  }

  private setupCloseListener(): void {
    this.dialogElement.addEventListener('close', () => {
      this.dialogClosed.emit();
    });
  }
}
