namespace API.Dtos.Auth;

using API.Dtos.User;

public sealed class AuthResponseDTO
{
    public UserDTO? User { get; set; }
    public required byte[] MasterPasswordSalt { get; set; }

}