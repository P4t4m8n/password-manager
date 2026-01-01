import { IEntity } from '../../../core/interfaces/entity.interface';

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
