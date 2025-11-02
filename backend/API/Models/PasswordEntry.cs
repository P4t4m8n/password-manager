using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Interfaces;
using Microsoft.Extensions.Configuration.UserSecrets;
namespace API.Models
{
    public class PasswordEntry : IGuid, ICrudDate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        [Required]
        public Guid UserId { get; set; }
        public string? EntryName { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? EntryUserName { get; set; }
        public byte[] EncryptedPassword { get; set; } = [];
        public string IV { get; set; } = "";
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}