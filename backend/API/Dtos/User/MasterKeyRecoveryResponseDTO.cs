namespace API.Dtos.User
{
    public sealed class MasterKeyRecoveryResponseDTO
    {
        public required byte[] EncryptedMasterKeyWithRecovery { get; set; }
        public required byte[] RecoveryIV { get; set; }
    }
}