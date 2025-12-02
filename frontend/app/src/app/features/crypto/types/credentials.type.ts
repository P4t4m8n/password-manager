export type TCredentials = {
  recoveryIV: string;
  encryptedMasterKeyWithRecovery: string;
  masterPasswordSalt: string;
};
