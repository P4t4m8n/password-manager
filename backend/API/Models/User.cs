using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Interfaces;

namespace API.Models
{
    public class User : IGuid, ICrudDate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        [Required(ErrorMessage = "required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Must be between {2} and {1} characters long")]
        [RegularExpression(@"^[a-zA-Z0-9\s]+$", ErrorMessage = "Only alphanumeric characters and spaces are allowed.")]
        public string? Username { get; set; }
        [Required]
        [EmailAddress]
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public byte[]? PasswordSalt { get; set; }
        public string? GoogleId { get; set; }
        [Required]
        public required byte[] MasterPasswordSalt { get; set; }
        public required byte[] EncryptedMasterKeyWithRecovery { get; set; }
        public required byte[] RecoveryIV { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}