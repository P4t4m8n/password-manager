
using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Auth;

public sealed class AuthSignUpDTO : AuthSignInDTO
{
    private string? _username;

    [Required(ErrorMessage = "Username is required")]
    [MaxLength(100, ErrorMessage = "Username cannot exceed 100 characters")]
    public string? Username
    {
        get => _username;
        set => _username = value?.Trim();
    }

    [Required(ErrorMessage = "Password is required")]
    [Compare("Password", ErrorMessage = "Passwords do not match")]
    public string? ConfirmPassword { get; set; }
}
