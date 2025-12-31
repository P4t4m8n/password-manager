import { PASSWORD_ENTRIES_PATHS } from '../../../../features/password-entry/consts/password-entry-routes.const';
import { PASSWORD_GENERATOR_PATHS } from '../../../../features/password-generator/consts/password-generator-routes.const';
import { SETTINGS_PATHS } from '../../../../features/settings/const/settings-routes.const';

import { IconFavorite } from '../../../icons/icon-favorite/icon-favorite';
import { IconPasswordGenerator } from '../../../icons/icon-password-generator/icon-password-generator';
import { IconSettings } from '../../../icons/icon-settings/icon-settings';
import { IconVault } from '../../../icons/icon-vault/icon-vault';

import type { INavRoute } from '../../../interfaces/nav-route';

export const NAV_ROUTES: INavRoute[] = [
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
