namespace API.Dtos.Auth;

using API.Dtos.User;

public sealed class AuthResponseDTO
{
    public UserDTO? User { get; set; }
    public byte[]? MasterPasswordSalt { get; set; }
    public byte[]? MasterPasswordVerification { get; set; }
    public byte[]? MasterPasswordVerificationIV { get; set; }

}