using API.Enums;

namespace API.Dtos.User
{
    public sealed class UserSettingsDTO
    {

        public Guid UserId { get; set; }
        public int MasterPasswordTTLInMinutes { get; set; }
        public int AutoLockTimeInMinutes { get; set; }
        public ThemeEnum Theme { get; set; }
        public PasswordStrengthEnum MinimumPasswordStrength { get; set; }
        public StorageModeEnum MasterPasswordStorageMode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}