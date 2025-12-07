using API.Dtos.User;

namespace API.Interfaces
{
    public interface IUserSettingsService
    {

        Task<UserSettingsDTO> GetUserSettingsAsync(Guid userGuid);
        Task<UserSettingsDTO> UpdateUserSettingsAsync(UserSettingsDTO userSettingsDto);


    }
}