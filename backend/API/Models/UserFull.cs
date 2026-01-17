namespace API.Models
{
    public sealed class UserFull : User
    {
        public required UserSettings Settings { get; set; }
        public UserMasterPassword? MasterPassword { get; set; }
    }
}