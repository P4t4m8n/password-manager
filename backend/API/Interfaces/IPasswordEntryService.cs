using API.Dtos.PasswordEntry;
using API.QueryParams;

namespace API.Interfaces
{ 
    public interface IPasswordEntryService
    {
        Task<IEnumerable<PasswordEntryDTO>> GetPasswordEntriesAsync(Guid userGuid, PasswordEntryQueryParams queryParams);
        Task<PasswordEntryDTO> GetPasswordEntryByIdAsync(Guid userGuid, Guid entryId);
        Task<PasswordEntryDTO> CreatePasswordEntryAsync(Guid userGuid, PasswordEntryCreateDTO entryDto);
        Task<PasswordEntryDTO> UpdatePasswordEntryAsync(Guid userGuid, Guid entryId, PasswordEntryUpdateDTO entryDto);
        Task DeletePasswordEntryAsync(Guid userGuid, Guid entryId);
        Task<int> UpdateEntriesAfterRecoveryAsync(Guid userGuid, List<PasswordEntryUpdateDTO> updateDtos);
    }
}