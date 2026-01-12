import { IEntity } from '../../../core/interfaces/entity.interface';
import { TPasswordStrengthLevel } from '../../crypto/types/password.types';

export interface IPasswordEntryDto extends IEntity {
  entryName?: string;
  websiteUrl?: string;
  entryUserName?: string;
  encryptedPassword?: string;
  iv?: string;
  notes?: string;
  isLiked?: boolean;
}

export interface IPasswordEntryFilter {
  entryName?: string;
  isLiked?: boolean;
}

export interface IPasswordEntryEvaluated {
  passwordEntry: IPasswordEntryDto;
  strength: TPasswordStrengthLevel;
  timeToCrack: string;
  lastChange: Date | string;
  lastChangeStrength: TPasswordStrengthLevel;
  duplicated: number;
  _decryptedPassword?: string;
}

export interface INavigateToPasswordEntryEvent {
  path: 'edit' | 'details';
  passwordEntryId?: string;
}
