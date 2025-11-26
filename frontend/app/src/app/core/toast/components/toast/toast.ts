import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ToastService } from '../../services/toast-service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [NgClass],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast implements OnInit {
  @ViewChild('element', { static: false }) progressBar!: ElementRef;
  progressInterval!: number;

  private toastService = inject(ToastService);

  ngOnInit() {
    this.toastService.open.subscribe((data) => {
      if (data.show) {
        this.countDown();
      }
    });
  }

  get data() {
    return this.toastService.data;
  }

  countDown() {
    this.progressBar.nativeElement.style.width = this.toastService.data.progressWidth;

    this.progressInterval = setInterval(() => {
      const width = parseInt(this.progressBar.nativeElement.style.width, 10);

      if (width <= 0) {
        this.toastService.hide();
        clearInterval(this.progressInterval);
        return;
      }

      this.data.progressWidth = String(width - 2);
      this.progressBar.nativeElement.style.width = this.data.progressWidth + '%';
    }, 150);
  }

  get isOpenClass() {
    return this?.data.show ? 'open' : 'closed';
  }

  stopCountDown() {
    clearInterval(this.progressInterval);
  }
}
