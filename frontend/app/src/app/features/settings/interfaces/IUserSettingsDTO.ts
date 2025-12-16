import { IEntity } from '../../../core/interfaces/entity.interface';
import { TPasswordStrengthLevel } from '../../crypto/types/password.types';
import { TStorageMode, TTheme } from '../types/settings.type';

export interface IUserSettingsEditDTO extends IEntity {
  masterPasswordTTLInMinutes?: string | null;
  masterPasswordStorageMode?: TStorageMode | null;
  autoLockTimeInMinutes?: string | null;
  theme?: TTheme | null;
  minimumPasswordStrength?: TPasswordStrengthLevel | null;
}

export interface IUserSettingsDTO extends Required<IUserSettingsEditDTO> {}
