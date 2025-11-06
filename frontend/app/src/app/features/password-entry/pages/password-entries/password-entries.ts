import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PasswordEntryService } from '../../services/password-entry-service';
import { Subscription } from 'rxjs';
import { IPasswordEntryDto } from '../../interfaces/passwordEntryDto';
import { IconSearch } from "../../../../core/icons/icon-search/icon-search";
import { IconEye } from "../../../../core/icons/icon-eye/icon-eye";
import { IconPlus } from "../../../../core/icons/icon-plus/icon-plus";
import { IconSafety } from "../../../../core/icons/icon-safety/icon-safety";

@Component({
  selector: 'app-password-entities',
  imports: [IconSearch, IconEye, IconPlus, IconSafety],
  templateUrl: './password-entries.html',
  styleUrl: './password-entries.css',
})
export class PasswordEntries implements OnInit, OnDestroy {
  passwordEntryService = inject(PasswordEntryService);

  passwordEntries: IPasswordEntryDto[] = [];
  private subscription: Subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(this.passwordEntryService.get().subscribe());
    this.subscription.add(
      this.passwordEntryService.passwordEntries$.subscribe((entries) => {
        this.passwordEntries = entries;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
