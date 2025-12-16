import type { IEntity } from '../../../core/interfaces/entity.interface';
import type { TCredentials } from '../../crypto/types/credentials.type';
import { IUserDTO } from '../../user/interfaces/user-dto';

export interface IAuthSignInDto {
  email?: string;
  password?: string;
}

export interface IAuthSignUpDto extends IAuthSignInDto, Partial<TCredentials> {
  username?: string;
  confirmPassword?: string;
}

export interface IAuthResponseDto {
  user: IUserDTO | null;
  masterPasswordSalt: string;
}
