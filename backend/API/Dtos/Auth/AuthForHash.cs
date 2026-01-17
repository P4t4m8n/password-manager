
namespace API.Dtos.Auth;

public sealed partial class AuthForHash
{
    public byte[] PasswordHash { get; set; } = [];
    public byte[] PasswordSalt { get; set; } = [];

}