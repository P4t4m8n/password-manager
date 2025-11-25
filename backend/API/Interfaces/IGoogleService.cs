using API.Dtos.Google;

namespace API.Interfaces
{
    public interface IGoogleService
    {
        string GetCallbackUrl();
        Task<GoogleUserInfoDTO?> GetGoogleUserInfoAsync(string accessToken);
        Task<GoogleAuthResponseDTO?> GetGoogleAuthResponseAsync(string code);
    }
}