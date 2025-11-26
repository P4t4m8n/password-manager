import { Component, inject, OnInit } from '@angular/core';
import { MasterPasswordHttpService } from '../../services/master-password-http-service';

@Component({
  selector: 'app-master-password-recovery-page',
  imports: [],
  templateUrl: './master-password-recovery-page.html',
  styleUrl: './master-password-recovery-page.css',
})
export class MasterPasswordRecoveryPage implements OnInit {
  private masterPasswordHttpService = inject(MasterPasswordHttpService);
  ngOnInit(): void {
    this.masterPasswordHttpService.getMasterPasswordRecovery().subscribe({
      next: (data) => {
        console.log('Master Password Recovery Data:', data);
      },
      error: (error) => {
        console.error('Error fetching master password recovery data:', error);
      },
    });
  }
}
