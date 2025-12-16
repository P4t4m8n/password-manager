import { IEntity } from '../../../core/interfaces/entity.interface';
import { IUserSettingsDTO } from '../../settings/interfaces/IUserSettingsDTO';

export interface IMasterKeyRecoveryEditDTO {
  encryptedMasterKeyWithRecovery?: string;
  recoveryIV?: string;
  masterPasswordSalt?: string;
}

export interface IUserDTO extends IEntity {
  username: string;
  email: string;
  settings: IUserSettingsDTO;
}
