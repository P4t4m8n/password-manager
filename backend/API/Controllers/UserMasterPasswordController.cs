

using API.Dtos.Http;
using API.Dtos.User;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Extensions;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/user-master-password")]
    public sealed class MasterPasswordRecoveryController : ControllerBase
    {
        private readonly IUserMasterPasswordService _userMasterPasswordService;

        public MasterPasswordRecoveryController(IUserMasterPasswordService masterPasswordRecoveryService)
        {
            _userMasterPasswordService = masterPasswordRecoveryService;
        }
        [HttpGet("")]
        public async Task<ActionResult<HttpResponseDTO<UserMasterPasswordDTO>>> GetUserMasterPassword()
        {
            Guid userGuid = User.GetUserId();
            UserMasterPasswordDTO userMasterPassword = await _userMasterPasswordService.GetUserMasterPasswordAsync(userGuid);
            HttpResponseDTO<UserMasterPasswordDTO> httpResponse = new()
            {
                Data = userMasterPassword,
                Message = "User master password retrieved successfully.",
                StatusCode = 200
            };
            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpGet("master-password-recovery")]
        public async Task<ActionResult<HttpResponseDTO<MasterKeyRecoveryResponseDTO>>> GetMasterPasswordRecovery()
        {
            Guid userGuid = User.GetUserId();
            MasterKeyRecoveryResponseDTO? recoveryData = await _userMasterPasswordService.GetMasterPasswordRecoveryAsync(userGuid);
            HttpResponseDTO<MasterKeyRecoveryResponseDTO> httpResponse = new()
            {
                Data = recoveryData,
                Message = "Master password recovery data retrieved successfully.",
                StatusCode = 200
            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }




        [HttpPost("")]
        public async Task<ActionResult<HttpResponseDTO<UserMasterPasswordDTO>>> CreateMasterPasswordRecovery(MasterKeyRecoveryEditDTO createDto)
        {
            Guid userGuid = User.GetUserId();

            UserMasterPasswordDTO userMasterPasswordDto = await _userMasterPasswordService.CreateUserMasterPasswordAsync(userGuid, createDto);
            HttpResponseDTO<UserMasterPasswordDTO> httpResponse = new()
            {
                Data = userMasterPasswordDto,
                Message = "Master password recovery created successfully.",
                StatusCode = 201

            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }
        [HttpPut("")]
        public async Task<ActionResult<HttpResponseDTO<UserMasterPasswordDTO>>> UpdateMasterPasswordRecovery(MasterKeyRecoveryEditDTO updateDto)
        {
            Guid userGuid = User.GetUserId();

            UserMasterPasswordDTO userMasterPasswordDto = await _userMasterPasswordService.UpdateUserMasterPasswordAsync(userGuid, updateDto);

            HttpResponseDTO<UserMasterPasswordDTO> httpResponse = new()
            {
                Data = userMasterPasswordDto,
                Message = "Master password recovery updated successfully.",
                StatusCode = 201

            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }
    }
}