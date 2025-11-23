import { IEntity } from '../../../core/interfaces/entity';

export interface IAuthDto extends IEntity {
  username: string;
  email: string;
}

export interface IAuthSignInDto {
  email?: string;
  password?: string;
}

export interface IAuthSignUpDto extends IAuthSignInDto {
  username?: string;
  confirmPassword?: string;
  encryptedMasterKeyWithRecovery?: string;
  recoveryIV?: string;
  masterPasswordSalt?: string;
}

export interface IAuthResponseDto {
  user: IAuthDto | null;
  masterPasswordSalt: string;
}
