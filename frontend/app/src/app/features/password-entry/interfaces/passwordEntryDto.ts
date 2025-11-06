import { IEntity } from '../../../core/interfaces/entity';

export interface IPasswordEntryDto extends IEntity {
  entryName?: string;
  websiteUrl?: string;
  entryUserName?: string;
  encryptedPassword?: Uint8Array;
  iv?: Uint8Array;
  notes?: string;
}
