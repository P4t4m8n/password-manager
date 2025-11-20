
using Microsoft.AspNetCore.Mvc;
using API.QueryParams;
using System.Security.Claims;
using Dapper;
using API.Interfaces;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using API.Dtos.PasswordEntry;
using API.Dtos.Http;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/Password-entry")]
    public class PasswordEntryController : ControllerBase
    {
        private readonly IDataContext _contextDapper;

        public PasswordEntryController(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        [HttpGet("")]
        public async Task<ActionResult<List<PasswordEntryDto>>> GetEntries([FromQuery] PasswordEntryQueryParams queryParams)
        {

            string userId = User.FindFirstValue("userId") ?? "";

            if (userId == null)
            {
                HttpErrorResponseDTO errorResponse = new()
                {
                    Message = "Unauthorized access.",
                    StatusCode = 401,
                    Errors = new Dictionary<string, string>
                     {
                          { "Authentication", "User is not authenticated." }
                     }
                };
                return Unauthorized(errorResponse);
            }

            Guid userGuid = Guid.Parse(userId);
            int limit = queryParams.Limit ?? 10;
            int offset = queryParams.Offset ?? 0;

            string selectSql = @"EXEC PasswordSchema.spPasswordEntry_Select_Many
                                 @UserId=@UserId,
                                 @EntryName=@EntryName,
                                 @WebsiteUrl=@WebsiteUrl,
                                 @Limit=@Limit,
                                 @Offset=@Offset;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryName", queryParams.EntryName);
            parameters.Add("@WebsiteUrl", queryParams.WebsiteUrl);
            parameters.Add("@Limit", limit);
            parameters.Add("@Offset", offset);

            IEnumerable<PasswordEntry> entries = await _contextDapper.LoadData<PasswordEntry>(selectSql, parameters);

            HttpResponseDTO<IEnumerable<PasswordEntry>> response = new()
            {
                Data = entries,
                Message = "Entries retrieved successfully."
            };

            return Ok(response);
        }

        [HttpGet("{entryId}")]
        public async Task<ActionResult<PasswordEntryDto>> GetEntryById(Guid entryId)
        {
            string userId = User.FindFirstValue("userId") ?? "";

            if (userId == null)
            {
                return Unauthorized();
            }

            Guid userGuid = Guid.Parse(userId);

            string selectSql = @"EXEC PasswordSchema.spPasswordEntry_Select_ById
                                 @UserId=@UserId,
                                 @EntryId=@EntryId;";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryId", entryId);

            PasswordEntryDto? entry = await _contextDapper.LoadDataSingle<PasswordEntryDto>(selectSql, parameters);

            if (entry is null)
            {
                return NotFound();
            }

            return Ok(entry);
        }

        [HttpPost("edit")]
        public async Task<ActionResult<PasswordEntryDto>> CreateEntry(PasswordEntryEditDto entryDto)
        {
            try
            {
                string userId = User.FindFirstValue("userId") ?? "";

                if (userId == null)
                {
                    return Unauthorized();
                }

                Guid userGuid = Guid.Parse(userId);

                string insertSql = @"EXEC PasswordSchema.spPasswordEntry_Insert
                                     @UserId=@UserId,
                                     @EntryName=@EntryName,
                                     @WebsiteUrl=@WebsiteUrl,
                                     @EntryUserName=@EntryUserName,
                                     @EncryptedPassword=@EncryptedPassword,
                                     @IV=@IV,
                                     @Notes=@Notes;";


                DynamicParameters parameters = new();
                parameters.Add("@UserId", userGuid);
                parameters.Add("@EntryName", entryDto.EntryName);
                parameters.Add("@WebsiteUrl", entryDto.WebsiteUrl);
                parameters.Add("@EntryUserName", entryDto.EntryUserName);
                parameters.Add("@EncryptedPassword", entryDto.EncryptedPassword);
                parameters.Add("@IV", entryDto.IV);
                parameters.Add("@Notes", entryDto.Notes);

                PasswordEntryDto? entry = await _contextDapper.InsertAndReturn<PasswordEntryDto>(insertSql, parameters);

                if (entry == null)
                {
                    // This case might occur if the OUTPUT clause fails or returns nothing.
                    return BadRequest("Failed to create the entry.");
                }
                HttpResponseDTO<PasswordEntryDto> response = new()
                {
                    Data = entry,
                    Message = "Entry created successfully."
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                HttpErrorResponseDTO errorResponse = new()
                {
                    Message = "An error occurred while processing your request.",
                    StatusCode = 500,
                    Errors = new Dictionary<string, string>
                     {
                          { "ExceptionMessage", ex.Message }
                     }
                };

                return StatusCode(500, errorResponse);
            }
        }

        [HttpPut("edit/{entryId}")]
        public async Task<ActionResult<PasswordEntryDto>> UpdateEntry(Guid entryId, PasswordEntryEditDto entryDto)
        {
            string? userId = User.FindFirstValue("userId");

            if (userId == null)
            {
                return Unauthorized();
            }

            Guid userGuid = Guid.Parse(userId);

            string updateSql = @"EXEC PasswordSchema.spPasswordEntry_Update
                                 @UserId=@UserId,
                                 @EntryId=@EntryId,
                                 @EntryName=@EntryName,
                                 @WebsiteUrl=@WebsiteUrl,
                                 @EntryUserName=@EntryUserName,
                                 @EncryptedPassword=@EncryptedPassword,
                                 @IV=@IV,
                                 @Notes=@Notes;";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryId", entryId);
            parameters.Add("@EntryName", entryDto.EntryName);
            parameters.Add("@WebsiteUrl", entryDto.WebsiteUrl);
            parameters.Add("@EntryUserName", entryDto.EntryUserName);
            parameters.Add("@EncryptedPassword", entryDto.EncryptedPassword, System.Data.DbType.Binary);
            parameters.Add("@IV", entryDto.IV);
            parameters.Add("@Notes", entryDto.Notes);

            PasswordEntryDto? entry = await _contextDapper.InsertAndReturn<PasswordEntryDto>(updateSql, parameters);

            if (entry == null)
            {
                return NotFound();
            }

            return Ok(entry);
        }

        [HttpDelete("delete/{entryId}")]
        public async Task<ActionResult> DeleteEntry(Guid entryId)
        {
            string userId = User.FindFirstValue("userId") ?? "";

            string deleteSql = @"EXEC PasswordSchema.spPasswordEntry_Delete
                                 @UserId=@UserId,
                                 @EntryId=@EntryId;";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@UserId", userId);
            parameters.Add("@EntryId", entryId);

            int rowsAffected = await _contextDapper.ExecuteSql(deleteSql, parameters);

            if (rowsAffected == 0)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}