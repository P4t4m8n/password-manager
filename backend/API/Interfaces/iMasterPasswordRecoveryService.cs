using API.Dtos.User;

namespace API.Interfaces
{
    public interface IUserMasterPasswordServiceService
    {
        Task<MasterKeyRecoveryResponseDTO> GetMasterPasswordRecoveryAsync(Guid userId);
        Task<byte[]> UpdateMasterPasswordRecoveryAsync(Guid userId, MasterKeyRecoveryEditDTO updateDto);
    }
}