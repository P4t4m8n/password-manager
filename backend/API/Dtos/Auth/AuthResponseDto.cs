namespace API.Dtos.Auth;

using API.Dtos.User;

public class AuthResponseDto
{
    public UserDto? User { get; set; }
    public required byte[] MasterPasswordSalt { get; set; }

}