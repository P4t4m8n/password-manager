using API.Dtos.Auth;
using API.Dtos.User;

namespace API.Interfaces
{
    public interface IMasterPasswordRecoveryService
    {
        Task<MasterKeyRecoveryResponseDTO> GetMasterPasswordRecoveryAsync(Guid userId);
        Task<byte[]> UpdateMasterPasswordRecoveryAsync(Guid userId, MasterKeyRecoveryEditDTO updateDto);
        Task<byte[]> SetupMasterPasswordAsync(Guid userId, SetupMasterPasswordDTO setupDto);
    }
}