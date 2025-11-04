
namespace API.Dtos.Auth;

public partial class AuthConfirmationDto
{
    public byte[] PasswordHash { get; set; } = [];
    public byte[] Salt { get; set; } = [];
}