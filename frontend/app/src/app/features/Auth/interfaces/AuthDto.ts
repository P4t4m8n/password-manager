import { IEntity } from '../../../core/interfaces/entity';
import { TCredentials } from '../../crypto/types/credentials.type';

export interface IAuthDto extends IEntity {
  username: string;
  email: string;
}

export interface IAuthSignInDto {
  email?: string;
  password?: string;
}

export interface IAuthSignUpDto extends IAuthSignInDto, Partial<TCredentials> {
  username?: string;
  confirmPassword?: string;

}

export interface IAuthResponseDto {
  user: IAuthDto | null;
  masterPasswordSalt: string;
}
