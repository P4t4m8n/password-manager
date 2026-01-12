using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Auth;

public class AuthSignInDTO
{
    private string? _email;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? Email
    {
        get => _email;
        set => _email = value?.Trim();
    }

    [Required(ErrorMessage = "Password is required")]
    [MinLength(1, ErrorMessage = "Password cannot be empty")]
    public string? Password { get; set; }

}