using API.Interfaces;

namespace API.ModelsP
{
    public sealed class PasswordEntryUpdateAfterRecovery : IGuid
    {
        public Guid Id { get; set; }
        public required byte[] EncryptedPassword { get; set; }
        public required string IV { get; set; }
    }
}