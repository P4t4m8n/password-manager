
namespace API.Dtos.Auth;

public sealed partial class AuthConfirmationDTO
{
    public byte[] PasswordHash { get; set; } = [];
    public byte[] PasswordSalt { get; set; } = [];

}