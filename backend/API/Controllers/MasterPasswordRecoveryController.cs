

using API.Dtos.Http;
using API.Dtos.User;
using API.Exceptions;
using API.Interfaces;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Extensions;
using API.Dtos.Auth;
using API.Models;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/Master-password-recovery")]
    public sealed class MasterPasswordRecoveryController : ControllerBase
    {
        private readonly IDataContext _contextDapper;

        public MasterPasswordRecoveryController(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        [HttpGet("")]
        public async Task<ActionResult<HttpResponseDTO<MasterKeyRecoveryResponseDTO>>> GetMasterPasswordRecovery()
        {
            Guid userGuid = User.GetUserId();

            string selectSql = @"EXEC PasswordSchema.spUser_Select_MasterPasswordRecoveryData
                                 @UserId=@UserId;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);

            MasterKeyRecoveryResponseDTO? recoveryData = await _contextDapper
            .QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(selectSql, parameters)
            ?? throw new NotFoundException("User recovery data not found.");

            HttpResponseDTO<MasterKeyRecoveryResponseDTO> httpResponse = new()
            {
                Data = recoveryData,
                Message = "Master password recovery data retrieved successfully.",
                StatusCode = 200
            };

            return Ok(httpResponse);
        }

        [HttpPatch("")]
        public async Task<ActionResult<HttpResponseDTO<AuthResponseDTO>>> UpdateMasterPasswordRecovery(MasterKeyRecoveryEditDTO updateDto)
        {
            Guid userGuid = User.GetUserId();

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

            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(updateSql, parameters)
             ?? throw new NotFoundException("User not found.");

            HttpResponseDTO<byte[]> httpResponse = new()
            {
                Data = user.MasterPasswordSalt,
                Message = "Master password recovery updated successfully.",
                StatusCode = 201

            };

            return Ok(httpResponse);
        }
    }
}