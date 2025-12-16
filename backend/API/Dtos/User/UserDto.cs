
namespace API.Dtos.User;

public class UserDTO : ModelDTO
{
    public string? Username { get; set; }
    public string? Email { get; set; }

    public UserSettingsDTO? Settings { get; set; }
}
