
using Microsoft.AspNetCore.Mvc;
using API.QueryParams;
using Dapper;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using API.Dtos.PasswordEntry;
using API.Dtos.Http;
using API.Exceptions;
using API.Extensions;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/Password-entry")]
    public sealed class PasswordEntryController : ControllerBase
    {
        private readonly IDataContext _contextDapper;

        public PasswordEntryController(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<PasswordEntryDTO>>> GetEntries([FromQuery] PasswordEntryQueryParams queryParams)
        {

            Guid userGuid = User.GetUserId();

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

            IEnumerable<PasswordEntryDTO> entries = await _contextDapper.LoadData<PasswordEntryDTO>(selectSql, parameters);

            HttpResponseDTO<IEnumerable<PasswordEntryDTO>> httpResponse = new()
            {
                Data = entries,
                Message = "Entries retrieved successfully.",
                StatusCode = 200

            };

            return Ok(httpResponse);
        }

        [HttpGet("{entryId}")]
        public async Task<ActionResult<PasswordEntryDTO>> GetEntryById(Guid entryId)
        {
            Guid userGuid = User.GetUserId();

            string selectSql = @"EXEC PasswordSchema.spPasswordEntry_Select_ById
                                 @UserId=@UserId,
                                 @EntryId=@EntryId;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryId", entryId);

            PasswordEntryDTO? entry = await _contextDapper.QuerySingleOrDefaultAsync<PasswordEntryDTO>(selectSql, parameters)
             ?? throw new NotFoundException("Password Entry not found", new Dictionary<string, string>
                {
                    { "EntryId", entryId.ToString() }
                });

            HttpResponseDTO<PasswordEntryDTO> httpResponse = new()
            {
                Data = entry,
                Message = "Entry retrieved successfully."
            };

            return Ok(httpResponse);
        }

        [HttpPost("")]
        public async Task<ActionResult<PasswordEntryDTO>> CreateEntry(PasswordEntryCreateDTO entryDto)
        {

            Guid userGuid = User.GetUserId();

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

            PasswordEntryDTO? entry = await _contextDapper.QuerySingleOrDefaultAsync<PasswordEntryDTO>(insertSql, parameters)
             ?? throw new UnexpectedCaughtException("Failed to create password entry", new Dictionary<string, string>
                {
                        { "Insertion", "No entry was created in the database." }
                });

            HttpResponseDTO<PasswordEntryDTO> httpResponse = new()
            {
                Data = entry,
                Message = "Entry created successfully."
            };

            return Ok(httpResponse);


        }

        [HttpPut("{entryId}")]
        public async Task<ActionResult<PasswordEntryDTO>> UpdateEntry(Guid entryId, PasswordEntryUpdateDTO entryDto)
        {
            Guid userGuid = User.GetUserId();

            string updateSql = @"EXEC PasswordSchema.spPasswordEntry_Update
                                 @UserId=@UserId,
                                 @EntryId=@EntryId,
                                 @EntryName=@EntryName,
                                 @WebsiteUrl=@WebsiteUrl,
                                 @EntryUserName=@EntryUserName,
                                 @EncryptedPassword=@EncryptedPassword,
                                 @IV=@IV,
                                 @Notes=@Notes;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryId", entryId);
            parameters.Add("@EntryName", entryDto.EntryName);
            parameters.Add("@WebsiteUrl", entryDto.WebsiteUrl);
            parameters.Add("@EntryUserName", entryDto.EntryUserName);
            parameters.Add("@EncryptedPassword", entryDto.EncryptedPassword, System.Data.DbType.Binary);
            parameters.Add("@IV", entryDto.IV);
            parameters.Add("@Notes", entryDto.Notes);

            PasswordEntryDTO? entry = await _contextDapper.QuerySingleOrDefaultAsync<PasswordEntryDTO>(updateSql, parameters)
            ?? throw new UnexpectedCaughtException("Failed to update password entry", new Dictionary<string, string>
                {
                        { "Update", "No entry was updated in the database." }
                });

            HttpResponseDTO<PasswordEntryDTO> httpResponse = new()
            {
                Data = entry,
                Message = "Entry updated successfully."
            };

            return Ok(httpResponse);
        }

        [HttpDelete("{entryId}")]
        public async Task<ActionResult> DeleteEntry(Guid entryId)
        {
            Guid userGuid = User.GetUserId();


            string deleteSql = @"EXEC PasswordSchema.spPasswordEntry_Delete
                                 @UserId=@UserId,
                                 @EntryId=@EntryId;";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryId", entryId);

            int rowsAffected = await _contextDapper.ExecuteSql(deleteSql, parameters);

            if (rowsAffected == 0)
            {
                throw new NotFoundException("Password Entry not found", new Dictionary<string, string>
                {
                    { "EntryId", entryId.ToString() }
                });
            }

            HttpResponseDTO<object> httpResponse = new()
            {
                Data = null,
                Message = "Entry deleted successfully."
            };

            return Ok(httpResponse);
        }
    }
}