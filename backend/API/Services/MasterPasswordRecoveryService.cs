using API.Dtos.Auth;
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

            // Migrated: EXEC PasswordSchema.spUser_Select_MasterPasswordRecoveryData -> PG function
            string selectSql
             = @"SELECT * FROM password_schema.sp_user_select_master_password_recovery_data(
                                 @UserId)";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);

            MasterKeyRecoveryResponseDTO recoveryData = await _contextDapper
            .QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(selectSql, parameters)
            ?? throw new NotFoundException("User recovery data not found.");

            return recoveryData;
        }

        public async Task<byte[]> UpdateMasterPasswordRecoveryAsync(Guid userGuid, MasterKeyRecoveryEditDTO updateDto)
        {
            // Migrated: EXEC PasswordSchema.spUser_Update_MasterPasswordRecovery -> PG function
            string updateSql = @"SELECT * FROM password_schema.sp_user_update_master_password_recovery(
                                 @UserId, @EncryptedMasterKeyWithRecovery,
                                 @RecoveryIV, @MasterPasswordSalt,
                                 @MasterPasswordVerification, @MasterPasswordVerificationIV)";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EncryptedMasterKeyWithRecovery", updateDto.EncryptedMasterKeyWithRecovery);
            parameters.Add("@RecoveryIV", updateDto.RecoveryIV);
            parameters.Add("@MasterPasswordSalt", updateDto.MasterPasswordSalt);
            parameters.Add("@MasterPasswordVerification", updateDto.MasterPasswordVerification);
            parameters.Add("@MasterPasswordVerificationIV", updateDto.MasterPasswordVerificationIV);

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

        public async Task<byte[]> SetupMasterPasswordAsync(Guid userGuid, SetupMasterPasswordDTO setupDto)
        {
            string setupSql = @"SELECT * FROM password_schema.sp_user_setup_master_password(
                                 @UserId, @MasterPasswordSalt,
                                 @EncryptedMasterKeyWithRecovery, @RecoveryIV,
                                 @MasterPasswordVerification, @MasterPasswordVerificationIV)";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@MasterPasswordSalt", setupDto.MasterPasswordSalt);
            parameters.Add("@EncryptedMasterKeyWithRecovery", setupDto.EncryptedMasterKeyWithRecovery);
            parameters.Add("@RecoveryIV", setupDto.RecoveryIV);
            parameters.Add("@MasterPasswordVerification", setupDto.MasterPasswordVerification);
            parameters.Add("@MasterPasswordVerificationIV", setupDto.MasterPasswordVerificationIV);

            User user = await _contextDapper.QuerySingleOrDefaultAsync<User>(setupSql, parameters)
          ?? throw new NotFoundException("User not found.");

            if (user.MasterPasswordSalt == null || user.MasterPasswordSalt.Length == 0)
            {
                throw new UnexpectedCaughtException("Failed to set up master password.", new Dictionary<string, string>
                {
                    { "MasterPassword", "The master password salt is null or empty after setup." }
                });
            }

            return user.MasterPasswordSalt;
        }

    }
}