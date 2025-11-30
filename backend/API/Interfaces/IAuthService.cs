using API.Dtos.Auth;
using API.Dtos.Http;

namespace API.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDTO> SignInAsync(AuthSignInDTO dto, HttpResponse response);
        Task<AuthResponseDTO> SignUpAsync(AuthSignUpDTO dto, HttpResponse response);
        Task<AuthResponseDTO> CheckSessionAsync(Guid userId);
        Task<AuthResponseDTO> RefreshTokenAsync(Guid userId, HttpResponse response);
    }
}