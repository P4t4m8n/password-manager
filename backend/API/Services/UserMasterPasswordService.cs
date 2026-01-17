using API.Dtos.User;
using API.Exceptions;
using API.Interfaces;
using API.Models;
using Dapper;

namespace API.Services
{
    public sealed class UserMasterPasswordService : IUserMasterPasswordService
    {

        private readonly IDataContext _contextDapper;

        public UserMasterPasswordService(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        public async Task<MasterKeyRecoveryResponseDTO> GetMasterPasswordRecoveryAsync(Guid userGuid)
        {
            string selectSql
             = @"EXEC PasswordSchema.sp_UserMasterPassword_SELECT_MasterPasswordRecoveryData
                                 @UserId=@UserId;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);

            MasterKeyRecoveryResponseDTO recoveryData = await _contextDapper
            .QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(selectSql, parameters)
            ?? throw new NotFoundException("User recovery data not found.");

            return recoveryData;
        }

        public async Task<UserMasterPasswordDTO> GetUserMasterPasswordAsync(Guid userGuid)
        {
            string selectSql = @"EXEC PasswordSchema.sp_UserMasterPassword_SELECT_ByUserId
                                 @UserId=@UserId;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);

            UserMasterPasswordDTO userMasterPassword = await _contextDapper.QuerySingleOrDefaultAsync<UserMasterPasswordDTO>(selectSql, parameters)
             ?? throw new NotFoundException("User master password not found.");

            return userMasterPassword;
        }

        public async Task<UserMasterPasswordDTO> CreateUserMasterPasswordAsync(Guid userGuid, MasterKeyRecoveryEditDTO createDto)
        {
            string insertSql = @"EXEC PasswordSchema.sp_UserMasterPassword_INSERT
                                 @UserId=@UserId,
                                 @EncryptedMasterKeyWithRecovery=@EncryptedMasterKeyWithRecovery,
                                 @RecoveryIV=@RecoveryIV,
                                 @MasterPasswordSalt=@MasterPasswordSalt,
                                 @MasterEncryptedPasswordTest = @MasterEncryptedPasswordTest,
                                 @MasterEncryptedPasswordIV = @MasterEncryptedPasswordIV
                                 ;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EncryptedMasterKeyWithRecovery", createDto.EncryptedMasterKeyWithRecovery);
            parameters.Add("@RecoveryIV", createDto.RecoveryIV);
            parameters.Add("@MasterPasswordSalt", createDto.MasterPasswordSalt);
            parameters.Add("@MasterEncryptedPasswordTest", createDto.MasterEncryptedPasswordTest);
            parameters.Add("@MasterEncryptedPasswordIV", createDto.MasterEncryptedPasswordIV);

            UserMasterPassword userMasterPassword = await _contextDapper.QuerySingleOrDefaultAsync<UserMasterPassword>(insertSql, parameters)
          ?? throw new UnexpectedCaughtException("Failed to create user master password.", new Dictionary<string, string>
          {
              { "UserMasterPassword", " The created user master password is null." }
          });

            UserMasterPasswordDTO userMasterPasswordDto = new()
            {
                EncryptedMasterKeyWithRecovery = userMasterPassword.EncryptedMasterKeyWithRecovery,
                RecoveryIV = userMasterPassword.RecoveryIV,
                MasterEncryptedPasswordTest = userMasterPassword.MasterEncryptedPasswordTest,
                MasterEncryptedPasswordIV = userMasterPassword.MasterEncryptedPasswordIV
            };

            return userMasterPasswordDto;
        }

        public async Task<UserMasterPasswordDTO> UpdateUserMasterPasswordAsync(Guid userGuid, MasterKeyRecoveryEditDTO updateDto)
        {
            string updateSql = @"EXEC PasswordSchema.sp_UserMasterPassword_UPDATE
                                 @UserId=@UserId,
                                 @EncryptedMasterKeyWithRecovery=@EncryptedMasterKeyWithRecovery,
                                 @RecoveryIV=@RecoveryIV,
                                 @MasterPasswordSalt=@MasterPasswordSalt,
                                 @MasterEncryptedPasswordTest = @MasterEncryptedPasswordTest,
                                 @MasterEncryptedPasswordIV = @MasterEncryptedPasswordIV
                                 ;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EncryptedMasterKeyWithRecovery", updateDto.EncryptedMasterKeyWithRecovery);
            parameters.Add("@RecoveryIV", updateDto.RecoveryIV);
            parameters.Add("@MasterPasswordSalt", updateDto.MasterPasswordSalt);
            parameters.Add("@MasterEncryptedPasswordTest", updateDto.MasterEncryptedPasswordTest);
            parameters.Add("@MasterEncryptedPasswordIV", updateDto.MasterEncryptedPasswordIV);

            UserMasterPassword userMasterPassword = await _contextDapper.QuerySingleOrDefaultAsync<UserMasterPassword>(updateSql, parameters)
          ?? throw new NotFoundException("User master password not found.");

            if (userMasterPassword.MasterPasswordSalt == null || userMasterPassword.MasterPasswordSalt.Length == 0)
            {
                throw new UnexpectedCaughtException("Failed to update master password salt.", new Dictionary<string, string>
                {
                    { "MasterPassword", " The master password salt is null or empty after update." }
                });
            }

            UserMasterPasswordDTO userMasterPasswordDto = new()
            {
                EncryptedMasterKeyWithRecovery = userMasterPassword.EncryptedMasterKeyWithRecovery,
                RecoveryIV = userMasterPassword.RecoveryIV,
                MasterEncryptedPasswordTest = userMasterPassword.MasterEncryptedPasswordTest,
                MasterEncryptedPasswordIV = userMasterPassword.MasterEncryptedPasswordIV
            };

            return userMasterPasswordDto;
        }

    }
}