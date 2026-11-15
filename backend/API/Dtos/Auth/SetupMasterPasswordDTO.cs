using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Auth;

public sealed class SetupMasterPasswordDTO
{
    [Required(ErrorMessage = "Master password salt is required")]
    public byte[]? MasterPasswordSalt { get; set; }
    [Required(ErrorMessage = "Encrypted master key with recovery is required")]
    public byte[]? EncryptedMasterKeyWithRecovery { get; set; }
    [Required(ErrorMessage = "Recovery IV is required")]
    public byte[]? RecoveryIV { get; set; }
    [Required(ErrorMessage = "Master password verification is required")]
    public byte[]? MasterPasswordVerification { get; set; }
    [Required(ErrorMessage = "Master password verification IV is required")]
    public byte[]? MasterPasswordVerificationIV { get; set; }
}
