using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Interfaces;
namespace API.Models
{
    public class PasswordEntry : IGuid, ICrudDate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        [Required]
        public required Guid UserId { get; set; }
        public string? EntryName { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? EntryUserName { get; set; }
        public required byte[] EncryptedPassword { get; set; }
        public required string IV { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}