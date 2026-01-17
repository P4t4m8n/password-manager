using API.Dtos.User;

namespace API.Interfaces
{
    public interface IUserMasterPasswordService
    {
        Task<MasterKeyRecoveryResponseDTO> GetMasterPasswordRecoveryAsync(Guid userId);
        Task<UserMasterPasswordDTO> UpdateUserMasterPasswordAsync(Guid userId, MasterKeyRecoveryEditDTO updateDto);
        Task<UserMasterPasswordDTO> GetUserMasterPasswordAsync(Guid userGuid);
        Task<UserMasterPasswordDTO> CreateUserMasterPasswordAsync(Guid userGuid, MasterKeyRecoveryEditDTO createDto);
    }
}