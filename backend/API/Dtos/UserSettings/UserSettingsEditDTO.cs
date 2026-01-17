using API.Enums;

namespace API.Dtos.User
{
    public sealed class UserSettingsEditDTO
    {

        public Guid UserId { get; set; }
        public int? MasterPasswordTTLInMinutes { get; set; } = 30;
        public int? AutoLockTimeInMinutes { get; set; } = 5;
        public ThemeEnum? Theme { get; set; } = ThemeEnum.system;
        public PasswordStrengthEnum? MinimumPasswordStrength { get; set; } = PasswordStrengthEnum.veryStrong;
        public StorageModeEnum? MasterPasswordStorageMode { get; set; } = StorageModeEnum.none;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}