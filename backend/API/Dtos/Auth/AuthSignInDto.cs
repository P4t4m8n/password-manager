using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Auth;

public class AuthSignInDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public  string? Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [MinLength(1, ErrorMessage = "Password cannot be empty")]
    public  string? Password { get; set; }

}