
namespace API.Dtos.Auth;

public class AuthSignUpDto : AuthSignInDto
{
    public string? Username { get; set; }
    public string? ConfirmPassword { get; set; }
    public byte[]? EncryptedMasterRecovery { get; set; }
    public byte[]? MasterPasswordSalt { get; set; }

}
