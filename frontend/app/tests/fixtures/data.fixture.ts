import type { IAuthSignUpDto } from '../../src/app/features/auth/interfaces/auth.interface';
import type { IPasswordEntryDto } from '../../src/app/features/password-entry/interfaces/passwordEntry';

export function generateTestEmail(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
}

export function generateUsername(): string {
  return `test-user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export function createTestUser(): Required<IAuthSignUpDto> {
  return {
    email: generateTestEmail(),
    username: generateUsername(),
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    encryptedMasterKeyWithRecovery: 'MasterPass123!',
    recoveryIV: 'RecoveryIV123!',
    masterPasswordSalt: 'MasterSalt123!',
  };
}

export const TEST_ENTRIES: Record<string, IPasswordEntryDto> = {
  gmail: {
    entryName: 'Gmail Account',
    websiteUrl: 'https://gmail.com',
    entryUserName: 'user@gmail.com',
    encryptedPassword: 'GmailPass123!',
    notes: 'Personal email account',
    isFavorite: false,
  },
  github: {
    entryName: 'GitHub',
    websiteUrl: 'https://github.com',
    entryUserName: 'developer',
    encryptedPassword: 'GitHubSecure456!',
    notes: 'Development account',
    isFavorite: true,
  },
  netflix: {
    entryName: 'Netflix',
    websiteUrl: 'https://netflix.com',
    entryUserName: 'viewer@example.com',
    encryptedPassword: 'NetflixPass789!',
    isFavorite: false,
  },
} as const;

export function createTestPasswordEntry(name?: string): IPasswordEntryDto {
  const timestamp = Date.now();
  return {
    entryName: name || `Test Entry ${timestamp}`,
    websiteUrl: `https://test-${timestamp}.com`,
    entryUserName: `user_${timestamp}@test.com`,
    encryptedPassword: `TestPass${timestamp}!`,
    notes: `Test notes created at ${new Date().toISOString()}`,
    isFavorite: false,
  };
}
