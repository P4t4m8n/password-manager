export interface IMasterKeyRecoveryEditDTO {
  encryptedMasterKeyWithRecovery?: string;
  recoveryIV?: string;
  masterPasswordSalt?: string;
}
