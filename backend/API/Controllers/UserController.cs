

using API.Dtos.Http;
using API.Dtos.User;
using API.Exceptions;
using API.Interfaces;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Extensions;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/User")]
    public sealed class UserController : ControllerBase
    {
        private readonly IDataContext _contextDapper;

        public UserController(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        [HttpGet("master-password-recovery")]
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
    }
}