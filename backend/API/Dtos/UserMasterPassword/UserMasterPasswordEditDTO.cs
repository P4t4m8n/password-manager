using System.ComponentModel.DataAnnotations;

namespace API.Dtos.User
{
    public sealed class MasterKeyRecoveryEditDTO
    {
        [Required(ErrorMessage = "Encrypted master key with recovery is required")]
        public byte[]? EncryptedMasterKeyWithRecovery { get; set; }

        [Required(ErrorMessage = "Recovery IV is required")]
        public byte[]? RecoveryIV { get; set; }

        [Required(ErrorMessage = "Master password salt is required")]
        public byte[]? MasterPasswordSalt { get; set; }

        [Required(ErrorMessage = "Master password test is required")]
        public byte[]? MasterEncryptedPasswordTest { get; set; }
        [Required(ErrorMessage = "Master password IV test is required")]
        public string? MasterEncryptedPasswordIV { get; set; }
    }
}