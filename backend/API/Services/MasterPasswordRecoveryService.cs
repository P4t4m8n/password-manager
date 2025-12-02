using API.Dtos.User;
using API.Exceptions;
using API.Interfaces;
using API.Models;
using Dapper;

namespace API.Services
{
    public sealed class MasterPasswordRecoveryService : IMasterPasswordRecoveryService
    {

        private readonly IDataContext _contextDapper;

        public MasterPasswordRecoveryService(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        public async Task<MasterKeyRecoveryResponseDTO> GetMasterPasswordRecoveryAsync(Guid userGuid)
        {

            
            string selectSql
             = @"EXEC PasswordSchema.spUser_Select_MasterPasswordRecoveryData
                                 @UserId=@UserId;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);

            MasterKeyRecoveryResponseDTO recoveryData = await _contextDapper
            .QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(selectSql, parameters)
            ?? throw new NotFoundException("User recovery data not found.");

            return recoveryData;
        }

        public async Task<byte[]> UpdateMasterPasswordRecoveryAsync(Guid userGuid, MasterKeyRecoveryEditDTO updateDto)
        {
            string updateSql = @"EXEC PasswordSchema.spUser_Update_MasterPasswordRecovery
                                 @UserId=@UserId,
                                 @EncryptedMasterKeyWithRecovery=@EncryptedMasterKeyWithRecovery,
                                 @RecoveryIV=@RecoveryIV,
                                 @MasterPasswordSalt=@MasterPasswordSalt;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EncryptedMasterKeyWithRecovery", updateDto.EncryptedMasterKeyWithRecovery);
            parameters.Add("@RecoveryIV", updateDto.RecoveryIV);
            parameters.Add("@MasterPasswordSalt", updateDto.MasterPasswordSalt);

            User user = await _contextDapper.QuerySingleOrDefaultAsync<User>(updateSql, parameters)
          ?? throw new NotFoundException("User not found.");

            if (user.MasterPasswordSalt == null || user.MasterPasswordSalt.Length == 0)
            {
                throw new UnexpectedCaughtException("Failed to update master password salt.", new Dictionary<string, string>
                {
                    { "MasterPassword", " The master password salt is null or empty after update." }
                });
            }

            return user.MasterPasswordSalt;
        }

    }
}