import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-master-password-dialog',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './master-password-dialog.html',
  styleUrl: './master-password-dialog.css',
})
export class MasterPasswordDialog {
  form = inject(FormBuilder).group({
    masterPassword: ['', Validators.required],
  });

  private resolvePromise: ((value: string | null) => void) | null = null;

  private router = inject(Router);

  navigateToRecovery(): void {
    if (this.resolvePromise) {
      this.resolvePromise(null);
      this.resolvePromise = null;
    }
    this.router.navigate(['/recovery']);
  }
  open(): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  submit(): void {
    if (this.form.valid && this.resolvePromise) {
      this.resolvePromise(this.form.value.masterPassword!);
      this.resolvePromise = null;
    }
  }

  cancel(): void {
    if (this.resolvePromise) {
      this.resolvePromise(null);
      this.resolvePromise = null;
    }
  }
}
