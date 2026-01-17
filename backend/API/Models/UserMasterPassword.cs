using API.Interfaces;
namespace API.Models;

public sealed class UserMasterPassword : IGuid, ICrudDate
{
    public Guid Id { get; set; }
    public required Guid UserId { get; set; }
    public required byte[] EncryptedMasterKeyWithRecovery { get; set; }
    public required byte[] RecoveryIV { get; set; }
    public required byte[] MasterEncryptedPasswordTest { get; set; }
    public required string MasterEncryptedPasswordIV { get; set; }
    public required byte[] MasterPasswordSalt { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
}