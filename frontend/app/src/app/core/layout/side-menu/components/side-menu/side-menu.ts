import { TitleCasePipe, CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, OnInit, inject, HostBinding } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subject,  takeUntil, filter } from 'rxjs';
import { IAuthDto } from '../../../../../features/auth/interfaces/AuthDto';
import { AuthService } from '../../../../../features/auth/services/auth.service';
import { IconCloseOpen } from '../../../../icons/icon-close-open/icon-close-open';
import { IconLogo } from '../../../../icons/icon-logo/icon-logo';
import { IconProfile } from '../../../../icons/icon-profile/icon-profile';
import { SwipeMenuService } from '../../services/swipe-menu-service';
import { NAV_ROUTES } from './side-menu.const';
import { IconSignout } from '../../../../icons/icon-signout/icon-signout';

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
  private authService = inject(AuthService);
  private router = inject(Router);
  private sideMenuService = inject(SwipeMenuService);
  private destroy$ = new Subject<void>();

  navRoutes = NAV_ROUTES;

  session_user: IAuthDto | null = null;

  ngOnInit(): void {
    this.authService.session_user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.session_user = user;
    });

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (window.innerWidth < 768) {
          this.sideMenuService.close();
        }
      });
  }

  onSignout() {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/auth']);
      },
      error: (err) => {
        console.error('Error during sign out', err);
      },
    });
  }
  @HostBinding('class.hide')
  get hide() {
    return !this.sideMenuService.getValue();
  }

  onToggle() {
    this.sideMenuService.toggle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
