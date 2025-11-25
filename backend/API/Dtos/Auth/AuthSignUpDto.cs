
using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Auth;

public sealed class AuthSignUpDTO : AuthSignInDTO
{

    [Required(ErrorMessage = "Username is required")]
    public string? Username { get; set; }
    [Required(ErrorMessage = "Password is required")]
    [Compare("Password", ErrorMessage = "Passwords do not match")]
    public string? ConfirmPassword { get; set; }
    [Required(ErrorMessage = "Master password is required")]
    public byte[]? EncryptedMasterKeyWithRecovery { get; set; }
    [Required(ErrorMessage = "Recovery IV is required")]
    public byte[]? RecoveryIV { get; set; }
    [Required(ErrorMessage = "Master password salt is required")]
    public byte[]? MasterPasswordSalt { get; set; }

}
