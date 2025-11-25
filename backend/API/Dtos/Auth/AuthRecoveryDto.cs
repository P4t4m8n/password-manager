
namespace API.Dtos.Auth;

public sealed class AuthRecoveryDTO
{
    public byte[]? NewEncryptedMasterKeyWithRecovery { get; set; }
    public byte[]? NewMasterPasswordSalt { get; set; }
    public string? NewPassword { get; set; }
    public string? NewConfirmPassword { get; set; }

}