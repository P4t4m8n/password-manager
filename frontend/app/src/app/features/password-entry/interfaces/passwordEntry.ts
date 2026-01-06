import { IEntity } from '../../../core/interfaces/entity.interface';
import { TPasswordStrength } from '../../crypto/services/password-evaluator-service';

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

export interface IEvaluatedPasswordSafety {
  passwordEntry: IPasswordEntryDto;
  strength: TPasswordStrength;
  timeToCrack: string;
  lastChange: Date | string;
  duplicated: number;
}
