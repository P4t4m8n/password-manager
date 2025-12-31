import { IEntity } from '../../../core/interfaces/entity.interface';

export interface IPasswordEntryDto extends IEntity {
  entryName?: string;
  websiteUrl?: string;
  entryUserName?: string;
  encryptedPassword?: string;
  iv?: string;
  notes?: string;
  isFavorite?: boolean;
}

export interface IPasswordEntryFilter {
  entryName?: string;
  isFavorite?: boolean;
}
