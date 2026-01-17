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
    [Route("api/user-settings")]

    public sealed class UserSettingsController : ControllerBase
    {

        private readonly IUserSettingsService _userSettingsService;
        public UserSettingsController(
            IUserSettingsService userSettingsService
        )
        {
            _userSettingsService = userSettingsService;
        }


        [HttpGet("")]
        public async Task<ActionResult<HttpResponseDTO<UserSettingsDTO>>> GetUserSettings()
        {
            Guid userGuid = User.GetUserId();

            UserSettingsDTO userSettings = await _userSettingsService.GetUserSettingsAsync(userGuid);
            HttpResponseDTO<UserSettingsDTO> httpResponse = new()
            {
                Data = userSettings,
                Message = "User settings retrieved successfully.",
                StatusCode = 200
            };
            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpPut("")]
        public async Task<ActionResult<HttpResponseDTO<UserSettingsDTO>>> UpdateUserSettings(UserSettingsDTO userSettingsDto)
        {
            Guid userGuid = User.GetUserId();
            userSettingsDto.UserId = userGuid;

            UserSettingsDTO updatedSettings = await _userSettingsService.UpdateUserSettingsAsync(userSettingsDto);
            HttpResponseDTO<UserSettingsDTO> httpResponse = new()
            {
                Data = updatedSettings,
                Message = "User settings updated successfully.",
                StatusCode = 200
            };
            return StatusCode(httpResponse.StatusCode, httpResponse);
        }


    }
}