using System.Data;
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

            return entries;
        }

        public async Task<PasswordEntryDTO> GetPasswordEntryByIdAsync(Guid userGuid, Guid entryId)
        {
            string selectSql = @"EXEC PasswordSchema.spPasswordEntry_Select_ById
                                 @UserId=@UserId,
                                 @EntryId=@EntryId;";

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

            PasswordEntryDTO entry = await _contextDapper.QuerySingleOrDefaultAsync<PasswordEntryDTO>(insertSql, parameters)
             ?? throw new UnexpectedCaughtException("Failed to create password entry", new Dictionary<string, string>
                {
                        { "Insertion", "No entry was created in the database." }
                });

            return entry;
        }
        public async Task<PasswordEntryDTO> UpdatePasswordEntryAsync(Guid userGuid, Guid entryId, PasswordEntryUpdateDTO entryDto)
        {
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

            return entry;
        }

        public async Task DeletePasswordEntryAsync(Guid userGuid, Guid entryId)
        {
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
        }

        public async Task<int> UpdateEntriesAfterRecoveryAsync(Guid userGuid, List<PasswordEntryUpdateDTO> updateDtos)
        {
            DataTable tvp = new();
            tvp.Columns.Add("Id", typeof(Guid));
            tvp.Columns.Add("EncryptedPassword", typeof(byte[]));
            tvp.Columns.Add("IV", typeof(string));

            foreach (var dto in updateDtos)
            {
                tvp.Rows.Add(dto.Id, dto.EncryptedPassword, dto.IV);
            }
            string updateSql = @"
                UPDATE pe
                SET pe.EncryptedPassword = e.EncryptedPassword,
                pe.IV = e.IV
                FROM PasswordSchema.PasswordEntry pe
                INNER JOIN @Entries e ON pe.Id = e.Id
                WHERE pe.UserId = @UserId;";


            DynamicParameters parameters = new();
            parameters.Add("@UserId", userGuid);
            parameters.Add(
                "@Entries",
                tvp.AsTableValuedParameter("PasswordSchema.PasswordEntryUpdateAfterRecoveryTable")
            );

            return await _contextDapper.ExecuteSql(updateSql, parameters);

        }
    }
}