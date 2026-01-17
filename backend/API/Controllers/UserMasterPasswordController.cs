

using API.Dtos.Http;
using API.Dtos.User;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Extensions;
using API.Dtos.Auth;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/user-master-password")]
    public sealed class MasterPasswordRecoveryController : ControllerBase
    {
        private readonly IUserMasterPasswordServiceService _masterPasswordRecoveryService;

        public MasterPasswordRecoveryController(IUserMasterPasswordServiceService masterPasswordRecoveryService)
        {
            _masterPasswordRecoveryService = masterPasswordRecoveryService;
        }

        [HttpGet("")]
        public async Task<ActionResult<HttpResponseDTO<MasterKeyRecoveryResponseDTO>>> GetMasterPasswordRecovery()
        {
            Guid userGuid = User.GetUserId();
            MasterKeyRecoveryResponseDTO? recoveryData = await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(userGuid);
            HttpResponseDTO<MasterKeyRecoveryResponseDTO> httpResponse = new()
            {
                Data = recoveryData,
                Message = "Master password recovery data retrieved successfully.",
                StatusCode = 200
            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpPatch("")]
        public async Task<ActionResult<HttpResponseDTO<AuthResponseDTO>>> UpdateMasterPasswordRecovery(MasterKeyRecoveryEditDTO updateDto)
        {
            Guid userGuid = User.GetUserId();

            byte[] masterPasswordSalt = await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(userGuid, updateDto);

            HttpResponseDTO<byte[]> httpResponse = new()
            {
                Data = masterPasswordSalt,
                Message = "Master password recovery updated successfully.",
                StatusCode = 201

            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }
    }
}