namespace API.Dtos.PasswordEntry;

public class PasswordEntryDTO : ModelDTO
{

    public string? EntryName { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? EntryUserName { get; set; }
    public byte[]? EncryptedPassword { get; set; }
    public string? IV { get; set; }
    public string? Notes { get; set; }
}