import { IconPasswordGenerator } from "../../../../icons/icon-password-generator/icon-password-generator";
import { IconSettings } from "../../../../icons/icon-settings/icon-settings";
import { IconVault } from "../../../../icons/icon-vault/icon-vault";
import { INavRoute } from "../../../../interfaces/navRoute";


export const NAV_ROUTES: INavRoute[] = [
  {
    route: '/entries',
    label: 'entries',
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
] as const;
