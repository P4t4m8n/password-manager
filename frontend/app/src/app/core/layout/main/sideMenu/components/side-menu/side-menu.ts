import {
  Component,
  ElementRef,
  HostBinding,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IconLogo } from '../../../../../icons/icon-logo/icon-logo';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { IconCloseOpen } from '../../../../../icons/icon-close-open/icon-close-open';
import { AuthService } from '../../../../../../features/Auth/services/auth.service';
import { IAuthDto } from '../../../../../../features/Auth/interfaces/AuthDto';
import { INavRoute } from '../../../../../interfaces/navRoute';
import { IconSettings } from '../../../../../icons/icon-settings/icon-settings';
import { IconPasswordGenerator } from '../../../../../icons/icon-password-generator/icon-password-generator';
import { IconVault } from '../../../../../icons/icon-vault/icon-vault';
@Component({
  selector: 'app-side-menu',
  imports: [TitleCasePipe, IconLogo, RouterLink, CommonModule, NgComponentOutlet, IconCloseOpen,RouterLinkActive],
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
      icon: IconVault,
    },
    {
      route: '/password-generator',
      label: 'password generator',
      icon: IconPasswordGenerator,
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
