import { IEntity } from '../../../core/interfaces/entity';

export interface IPasswordEntryDto extends IEntity {
  entryName?: string;
  websiteUrl?: string;
  entryUserName?: string;
  encryptedPassword?: string;
  iv?: string;
  notes?: string;
}

