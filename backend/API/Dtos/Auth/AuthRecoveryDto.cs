using API.Dtos.Auth;

public class AuthRecoveryDto 
{
    public byte[]? NewRecoveryKeyHash { get; set; }
    public byte[]? NewMekEncryptedWithRecovery { get; set; }
    public string? NewPassword { get; set; }
    public string? NewConfirmPassword { get; set; }

}