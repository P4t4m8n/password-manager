using API.Dtos.PasswordEntry;
using API.Exceptions;
using API.Interfaces;
using API.QueryParams;
using Dapper;


namespace API.Services
{


    public sealed class PasswordEntryService : IPasswordEntryService
    {
        private readonly IDataContext _contextDapper;

        public PasswordEntryService(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        public async Task<IEnumerable<PasswordEntryDTO>> GetPasswordEntriesAsync(Guid userGuid, PasswordEntryQueryParams queryParams)
        {
            int limit = queryParams.Limit ?? 10;
            int offset = queryParams.Offset ?? 0;

            // Migrated: EXEC PasswordSchema.spPasswordEntry_Select_Many -> PG function
            string selectSql = @"SELECT * FROM password_schema.sp_password_entry_select_many(
                                 @UserId, @EntryName, @WebsiteUrl, @Offset, @Limit)";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryName", queryParams.EntryName);
            parameters.Add("@WebsiteUrl", queryParams.WebsiteUrl);
            parameters.Add("@Limit", limit);
            parameters.Add("@Offset", offset);

            IEnumerable<PasswordEntryDTO> entries = await _contextDapper.LoadData<PasswordEntryDTO>(selectSql, parameters);

            return entries;
        }

        public async Task<PasswordEntryDTO> GetPasswordEntryByIdAsync(Guid userGuid, Guid entryId)
        {
            // Migrated: EXEC PasswordSchema.spPasswordEntry_Select_ById -> PG function
            string selectSql = @"SELECT * FROM password_schema.sp_password_entry_select_by_id(
                                 @UserId, @EntryId)";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryId", entryId);

            PasswordEntryDTO entry = await _contextDapper.QuerySingleOrDefaultAsync<PasswordEntryDTO>(selectSql, parameters)
             ?? throw new NotFoundException("Password Entry not found", new Dictionary<string, string>
                {
                    { "EntryId", entryId.ToString() }
                });

            return entry;
        }

        public async Task<PasswordEntryDTO> CreatePasswordEntryAsync(Guid userGuid, PasswordEntryCreateDTO entryDto)
        {
            // Migrated: EXEC PasswordSchema.spPasswordEntry_Insert -> PG function
            string insertSql = @"SELECT * FROM password_schema.sp_password_entry_insert(
                                     @UserId, @EntryName, @WebsiteUrl,
                                     @EntryUserName, @EncryptedPassword, @IV, @Notes)";


            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryName", entryDto.EntryName);
            parameters.Add("@WebsiteUrl", entryDto.WebsiteUrl);
            parameters.Add("@EntryUserName", entryDto.EntryUserName);
            parameters.Add("@EncryptedPassword", entryDto.EncryptedPassword);
            parameters.Add("@IV", entryDto.IV);
            parameters.Add("@Notes", entryDto.Notes);

            PasswordEntryDTO entry = await _contextDapper.QuerySingleOrDefaultAsync<PasswordEntryDTO>(insertSql, parameters)
             ?? throw new UnexpectedCaughtException("Failed to create password entry", new Dictionary<string, string>
                {
                        { "Insertion", "No entry was created in the database." }
                });

            return entry;
        }
        public async Task<PasswordEntryDTO> UpdatePasswordEntryAsync(Guid userGuid, Guid entryId, PasswordEntryUpdateDTO entryDto)
        {
            // Migrated: EXEC PasswordSchema.spPasswordEntry_Update -> PG function
            string updateSql = @"SELECT * FROM password_schema.sp_password_entry_update(
                                 @UserId, @EntryId, @EntryName, @WebsiteUrl,
                                 @EntryUserName, @EncryptedPassword, @IV, @Notes, @IsLiked)";


            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryId", entryId);
            parameters.Add("@EntryName", entryDto.EntryName);
            parameters.Add("@WebsiteUrl", entryDto.WebsiteUrl);
            parameters.Add("@EntryUserName", entryDto.EntryUserName);
            parameters.Add("@EncryptedPassword", entryDto.EncryptedPassword, System.Data.DbType.Binary);
            parameters.Add("@IV", entryDto.IV);
            parameters.Add("@Notes", entryDto.Notes);
            parameters.Add("@IsLiked", entryDto.IsLiked);

            PasswordEntryDTO? entry = await _contextDapper.QuerySingleOrDefaultAsync<PasswordEntryDTO>(updateSql, parameters)
            ?? throw new UnexpectedCaughtException("Failed to update password entry", new Dictionary<string, string>
                {
                        { "Update", "No entry was updated in the database." }
                });

            return entry;
        }

        public async Task DeletePasswordEntryAsync(Guid userGuid, Guid entryId)
        {
            // Migrated: EXEC PasswordSchema.spPasswordEntry_Delete -> PG function
            string deleteSql = @"SELECT password_schema.sp_password_entry_delete(
                                 @UserId, @EntryId)";

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
        }

        public async Task<int> UpdateEntriesAfterRecoveryAsync(Guid userGuid, List<PasswordEntryUpdateDTO> updateDtos)
        {
            // Migrated: TVP (DataTable) -> JSONB array for PostgreSQL
            // PG function expects a JSONB array: [{"Id":"...","EncryptedPassword":"base64","IV":"..."},...]
            var entriesJson = System.Text.Json.JsonSerializer.Serialize(
                updateDtos.Select(dto => new
                {
                    Id = dto.Id,
                    EncryptedPassword = dto.EncryptedPassword != null ? Convert.ToBase64String(dto.EncryptedPassword) : "",
                    IV = dto.IV
                })
            );

            // Migrated: EXEC PasswordSchema.spPasswordEntry_Update_AfterRecovery -> PG function
            string updateSql = @"SELECT password_schema.sp_password_entry_update_after_recovery(
                                 @UserId, @Entries::jsonb)";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@Entries", entriesJson);

            return await _contextDapper.ExecuteSql(updateSql, parameters);
        }

        public async Task<bool> LikePasswordEntryAsync(Guid userGuid, Guid entryId)
        {
            // Migrated: EXEC PasswordSchema.spPasswordEntry_Like -> PG function
            string likeSql = @"SELECT password_schema.sp_password_entry_like(
                                 @UserId, @EntryId)";

            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add("@EntryId", entryId);

            return await _contextDapper.QuerySingleOrDefaultAsync<bool>(likeSql, parameters);
        }
    }
}