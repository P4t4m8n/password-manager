export type TCredentials = {
  recoveryIV: string;
  encryptedMasterKeyWithRecovery: string;
  masterPasswordSalt: string;
  masterPasswordVerification: string;
  masterPasswordVerificationIV: string;
};
