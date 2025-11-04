using API.Dtos.Auth;

namespace API.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> SignUpAsync(AuthSignUpDto authSignUpDto);
    Task<AuthResponseDto> SignInAsync(AuthSignInDto authSignInDto);
    Task SignOutAsync(string token);
}