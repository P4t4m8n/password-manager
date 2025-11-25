using System.ComponentModel.DataAnnotations;

namespace API.Dtos.PasswordEntry;

public sealed class PasswordEntryCreateDTO
{
    [Required(ErrorMessage = "Entry name is required")]
    public string? EntryName { get; set; }
    [Required(ErrorMessage = "Website URL is required")]
    public string? WebsiteUrl { get; set; }
    public string? EntryUserName { get; set; }
    [Required(ErrorMessage = "Encrypted password is required")]
    public byte[]? EncryptedPassword { get; set; }
    [Required(ErrorMessage = "IV is required")]
    public string? IV { get; set; }
    public string? Notes { get; set; }
}