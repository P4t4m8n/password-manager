
namespace API.Dtos.PasswordEntry;

public partial class PasswordEntryUpdateDTO : ModelDTO
{
    public string? EntryName { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? EntryUserName { get; set; }
    public byte[]? EncryptedPassword { get; set; }
    public string? IV { get; set; }
    public string? Notes { get; set; }
    public bool IsLiked { get; set; }
}