
namespace API.Dtos.Auth;

public class AuthRecoveryDto
{
    public byte[]? NewEncryptedMasterKeyWithRecovery { get; set; }
    public byte[]? NewMasterPasswordSalt { get; set; }
    public string? NewPassword { get; set; }
    public string? NewConfirmPassword { get; set; }

}