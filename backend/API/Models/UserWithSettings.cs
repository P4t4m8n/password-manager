namespace API.Models
{
    public sealed class UserWithSettings : User
    {
        
        public required UserSettings Settings { get; set; }
    }
}