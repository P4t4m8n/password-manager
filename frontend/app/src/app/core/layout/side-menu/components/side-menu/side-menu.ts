import { TitleCasePipe, CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, OnInit, inject, HostBinding } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';

import { AuthHttpService } from '../../../../../features/auth/services/auth-http-service';
import { ErrorService } from '../../../../services/error-service';
import { SwipeMenuService } from '../../services/swipe-menu-service';

import { NAV_ROUTES } from '../../const/side-menu.const';

import { IconCloseOpen } from '../../../../icons/icon-close-open/icon-close-open';
import { IconLogo } from '../../../../icons/icon-logo/icon-logo';
import { IconProfile } from '../../../../icons/icon-profile/icon-profile';
import { IconSignout } from '../../../../icons/icon-signout/icon-signout';
import { IUserDTO } from '../../../../../features/user/interfaces/user-dto';

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
    IconProfile,
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

  readonly navRoutes = NAV_ROUTES;

  session_user: IUserDTO | null = null;

  ngOnInit(): void {
    this.#authHttpService.data$.pipe(takeUntil(this.#destroy$)).subscribe({
      next: (user) => {
        this.session_user = user;
      },
      error: (err) => {
        this.#errorService.handleError(err, { showToast: true });
      },
    });

    this.#router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.#destroy$)
      )
      .subscribe(() => {
        if (window.innerWidth < 768) {
          this.#sideMenuService.close();
        }
      });
  }

  onSignout() {
    this.#authHttpService.signOut().subscribe({
      next: () => {
        this.#router.navigate(['/auth']);
      },
      error: (err) => {
        this.#errorService.handleError(err, { showToast: true });
      },
    });
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
  }
}
