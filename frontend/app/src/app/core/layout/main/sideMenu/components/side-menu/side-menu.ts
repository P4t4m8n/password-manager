import { Component, HostBinding, inject, OnInit, signal } from '@angular/core';

import { TitleCasePipe } from '@angular/common';
import { IconLogo } from '../../../../../icons/icon-logo/icon-logo';
import { RouterLink } from '@angular/router';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { IconCloseOpen } from '../../../../../icons/icon-close-open/icon-close-open';
import { AuthService } from '../../../../../../features/Auth/services/auth.service';
import { IAuthDto } from '../../../../../../features/Auth/interfaces/AuthDto';
import { INavRoute } from '../../../../../interfaces/navRoute';
import { IconPatients } from '../../../../../icons/icon-patients/icon-patients';
import { IconSettings } from '../../../../../icons/icon-settings/icon-settings';
@Component({
  selector: 'app-side-menu',
  imports: [TitleCasePipe, IconLogo, RouterLink, CommonModule, NgComponentOutlet, IconCloseOpen],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.css',
  hostDirectives: [],
})
export class SideMenu implements OnInit {
  authService = inject(AuthService);
  navRoutes: INavRoute[] = [
    {
      route: '/logins',
      label: 'logins',
      icon: IconPatients,
    },
    {
      route: '/password-generator',
      label: 'password generator',
      icon: IconPatients,
    },
    {
      route: '/settings',
      label: 'settings',
      icon: IconSettings,
    },
  ];

  isOpen = signal(true);

  session_user: IAuthDto | null = null;

  ngOnInit(): void {
    this.authService._session_user$.subscribe((user) => {
      this.session_user = user;
    });
  }

  @HostBinding('class.hide')
  get hide() {
    return !this.isOpen();
  }

  onToggle() {
    this.isOpen.set(!this.isOpen());
  }
}
