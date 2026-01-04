import { inject, Injectable } from '@angular/core';
import { filter } from 'rxjs';

import { AbstractGlobalStateService } from '../abstracts/abstract-global-state-service.abstract';
import { UserSettingsStateService } from '../../features/settings/services/user-settings-state-service';

import type { TTheme } from '../../features/settings/types/settings.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService extends AbstractGlobalStateService<TTheme | null> {
  #systemPreference: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  #userSettingsStateService = inject(UserSettingsStateService);

  constructor() {
    super();
    this.initTheme();
    this.watchSystemPreference();
    this.watchUserSettingsChanges();
  }

  private initTheme(): void {
    const themeMode: TTheme = this.#userSettingsStateService.getCurrentState()?.theme ?? 'dark';
    this.setTheme(themeMode);
  }

  private watchSystemPreference(): void {
    this.#systemPreference.addEventListener('change', (e) => {
      if (this.getState() === 'system') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  private watchUserSettingsChanges(): void {
    this.#userSettingsStateService.state$
      .pipe(
        filter((settings) => {
          return settings !== null;
        })
      )
      .subscribe((settings) => {
        if (settings?.theme && settings.theme !== this.getState()) {
          this.setTheme(settings.theme);
        }
      });
  }

  /*
   * Set the theme mode: update state and assign a value in case of 'system' mode
   * Then call method to apply the theme to the document root
   */
  setTheme(mode: TTheme): void {
    this.updateState(mode);

    if (mode === 'system') {
      const isDark = this.#systemPreference.matches;
      this.applyTheme(isDark ? 'dark' : 'light');
    } else {
      this.applyTheme(mode);
    }
  }

  /*
   * Apply the theme by adding/removing CSS classes on the document root
   */
  private applyTheme(theme: Omit<TTheme, 'system'>): void {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }
}
