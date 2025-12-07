using API.Dtos.User;
using API.Exceptions;
using API.Interfaces;
using Dapper;

namespace API.Services
{
    public sealed class UserSettingsService : IUserSettingsService
    {
        private readonly IDataContext _contextDapper;

        public UserSettingsService(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        public async Task<UserSettingsDTO> GetUserSettingsAsync(Guid userGuid)
        {
            string selectSql = @"EXEC UserSchema.spUserSettings_Select_ByUserId
                                 @UserId=@UserId;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);

            UserSettingsDTO userSettings = await _contextDapper.QuerySingleOrDefaultAsync<UserSettingsDTO>(selectSql, parameters)
             ?? throw new Exception("User Settings not found");



            return userSettings;
        }

        public async Task<UserSettingsDTO> UpdateUserSettingsAsync(UserSettingsDTO userSettingsDTO)
        {
            string updateSql = @"EXEC UserSchema.spUserSettings_Update
                                 @UserId=@UserId,
                                 @MasterPasswordTTLInMinutes=@MasterPasswordTTLInMinutes,
                                 @AutoLockTimeInMinutes=@AutoLockTimeInMinutes,
                                 @Theme=@Theme,
                                 @MinimumPasswordStrength=@MinimumPasswordStrength,
                                 @MasterPasswordStorageMode=@MasterPasswordStorageMode;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userSettingsDTO.UserId);
            parameters.Add("@MasterPasswordTTLInMinutes", userSettingsDTO.MasterPasswordTTLInMinutes);
            parameters.Add("@AutoLockTimeInMinutes", userSettingsDTO.AutoLockTimeInMinutes);
            parameters.Add("@Theme", userSettingsDTO.Theme);
            parameters.Add("@MinimumPasswordStrength", userSettingsDTO.MinimumPasswordStrength);
            parameters.Add("@MasterPasswordStorageMode", userSettingsDTO.MasterPasswordStorageMode);

            UserSettingsDTO userSettings = await _contextDapper.QuerySingleOrDefaultAsync<UserSettingsDTO>(updateSql, parameters)
             ?? throw new UnexpectedCaughtException("Failed to update user settings", new Dictionary<string, string>
                {
                        { "Update", "No user settings were updated in the database." }
                }); ;

            return userSettings;
        }

    }
}