
using Microsoft.AspNetCore.Mvc;
using API.QueryParams;
using Microsoft.AspNetCore.Authorization;
using API.Dtos.PasswordEntry;
using API.Dtos.Http;
using API.Extensions;
using API.Interfaces;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/password-entry")]
    public sealed class PasswordEntryController : ControllerBase
    {
        private readonly IPasswordEntryService _passwordEntryService;

        public PasswordEntryController(IPasswordEntryService passwordEntryService)
        {
            _passwordEntryService = passwordEntryService;
        }

        [HttpGet("")]
        public async Task<ActionResult<HttpResponseDTO<IEnumerable<PasswordEntryDTO>>>> GetEntries([FromQuery] PasswordEntryQueryParams queryParams)
        {
            Guid userGuid = User.GetUserId();
            IEnumerable<PasswordEntryDTO> entries = await _passwordEntryService.GetPasswordEntriesAsync(userGuid, queryParams);
            HttpResponseDTO<IEnumerable<PasswordEntryDTO>> httpResponse = new()
            {
                Data = entries,
                Message = "Entries retrieved successfully.",
                StatusCode = 200
            };
            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpGet("{entryId}")]
        public async Task<ActionResult<HttpResponseDTO<PasswordEntryDTO>>> GetEntryById(Guid entryId)
        {
            Guid userGuid = User.GetUserId();
            PasswordEntryDTO? entry = await _passwordEntryService.GetPasswordEntryByIdAsync(userGuid, entryId);
            HttpResponseDTO<PasswordEntryDTO> httpResponse = new()
            {
                Data = entry,
                Message = "Entry retrieved successfully.",
                StatusCode = 200
            };
            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpPost("")]
        public async Task<ActionResult<HttpResponseDTO<PasswordEntryDTO>>> CreateEntry(PasswordEntryCreateDTO entryDto)
        {

            Guid userGuid = User.GetUserId();
            PasswordEntryDTO entry = await _passwordEntryService.CreatePasswordEntryAsync(userGuid, entryDto);
            HttpResponseDTO<PasswordEntryDTO> httpResponse = new()
            {
                Data = entry,
                Message = "Entry created successfully.",
                StatusCode = 201
            };

            return StatusCode(httpResponse.StatusCode, httpResponse);

        }

        [HttpPatch("{entryId}")]
        public async Task<ActionResult<HttpResponseDTO<PasswordEntryDTO>>> UpdateEntry(Guid entryId, PasswordEntryUpdateDTO entryDto)
        {
            Guid userGuid = User.GetUserId();
            PasswordEntryDTO? entry = await _passwordEntryService.UpdatePasswordEntryAsync(userGuid, entryId, entryDto);
            HttpResponseDTO<PasswordEntryDTO> httpResponse = new()
            {
                Data = entry,
                Message = "Entry updated successfully.",
                StatusCode = 200
            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpDelete("{entryId}")]
        public async Task<ActionResult<HttpResponseDTO<object>>> DeleteEntry(Guid entryId)
        {
            Guid userGuid = User.GetUserId();
            await _passwordEntryService.DeletePasswordEntryAsync(userGuid, entryId);
            HttpResponseDTO<object> httpResponse = new()
            {
                Data = null,
                Message = "Entry deleted successfully.",
                StatusCode = 200
            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpPatch("update-after-recovery")]
        public async Task<ActionResult<HttpResponseDTO<int>>> UpdateEntriesAfterRecovery(List<PasswordEntryUpdateDTO> updateDtos)
        {
            Guid userGuid = User.GetUserId();
            int rowsAffected = await _passwordEntryService.UpdateEntriesAfterRecoveryAsync(userGuid, updateDtos);
            HttpResponseDTO<int> httpResponse = new()
            {
                Data = rowsAffected,
                Message = "Entries updated successfully after recovery.",
                StatusCode = 200
            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }

        [HttpPatch("{entryId}/like")]
        public async Task<ActionResult<HttpResponseDTO<int>>> LikeEntry(Guid entryId)
        {
            Guid userGuid = User.GetUserId();
            bool isLiked = await _passwordEntryService.LikePasswordEntryAsync(userGuid, entryId);
            HttpResponseDTO<bool> httpResponse = new()
            {
                Data = isLiked,
                Message = "Entry liked successfully.",
                StatusCode = 200
            };

            return StatusCode(httpResponse.StatusCode, httpResponse);
        }
    }
}