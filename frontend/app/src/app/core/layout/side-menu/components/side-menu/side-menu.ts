import { TitleCasePipe, CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, OnInit, inject, HostBinding } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter, Subscription } from 'rxjs';

import { AuthHttpService } from '../../../../../features/auth/services/auth-http-service';
import { ErrorService } from '../../../../services/error-service';
import { SwipeMenuService } from '../../services/swipe-menu-service';

import { IconCloseOpen } from '../../../../icons/icon-close-open/icon-close-open';
import { IconLogo } from '../../../../icons/icon-logo/icon-logo';
import { IconSignout } from '../../../../icons/icon-signout/icon-signout';

import type { IUserDTO } from '../../../../../features/user/interfaces/user-dto';
import { PASSWORD_ENTRIES_PATHS } from '../../../../../features/password-entry/consts/password-entry-routes.const';
import { PASSWORD_GENERATOR_PATHS } from '../../../../../features/password-generator/consts/password-generator-routes.const';
import { SETTINGS_PATHS } from '../../../../../features/settings/const/settings-routes.const';
import { IconPasswordGenerator } from '../../../../icons/icon-password-generator/icon-password-generator';
import { IconSettings } from '../../../../icons/icon-settings/icon-settings';
import { IconVault } from '../../../../icons/icon-vault/icon-vault';

@Component({
  selector: 'app-side-menu',
  imports: [
    TitleCasePipe,
    IconLogo,
    RouterLink,
    CommonModule,
    NgComponentOutlet,
    IconCloseOpen,
    RouterLinkActive,
    IconSignout,
],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.css',
})
export class SideMenu implements OnInit {
  #authHttpService = inject(AuthHttpService);
  #router = inject(Router);
  #sideMenuService = inject(SwipeMenuService);
  #destroy$ = new Subject<void>();
  #errorService = inject(ErrorService);

  #subscription: Subscription = new Subscription();

  readonly navRoutes = [
    {
      route: `/${PASSWORD_ENTRIES_PATHS.passwordEntries}`,
      label: 'entries',
      icon: IconVault,
    },
    // {
    //   route: `/${PASSWORD_ENTRIES_PATHS.passwordEntriesFavorites}/`,
    //   label: 'favorites',
    //   icon: IconFavorite,
    // },
    {
      route: `/${PASSWORD_GENERATOR_PATHS.passwordGenerator}`,
      label: 'password generator',
      icon: IconPasswordGenerator,
    },
    {
      route: `/${SETTINGS_PATHS.settingsIndex}`,
      label: 'settings',
      icon: IconSettings,
    },
  ] as const;

  sessionUser: IUserDTO | null = null;

  ngOnInit(): void {
    this.#subscription.add(
      this.#authHttpService.data$.pipe(takeUntil(this.#destroy$)).subscribe({
        next: (user) => {
          this.sessionUser = user;
        },
        error: (err) => {
          this.#errorService.handleError(err, { showToast: true });
        },
      })
    );

    this.#subscription.add(
      this.#router.events
        .pipe(
          filter((e) => e instanceof NavigationEnd),
          takeUntil(this.#destroy$)
        )
        .subscribe(() => {
          if (window.innerWidth < 768) {
            this.#sideMenuService.close();
          }
        })
    );
  }

  onSignout() {
    this.#subscription.add(
      this.#authHttpService.signOut().subscribe({
        next: () => {
          this.#router.navigate(['/auth']);
        },
        error: (err) => {
          this.#errorService.handleError(err, { showToast: true });
        },
      })
    );
  }

  @HostBinding('class.hide')
  get hide() {
    return !this.#sideMenuService.getValue();
  }

  onToggle() {
    this.#sideMenuService.toggle();
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
    this.#subscription.unsubscribe();
  }
}
