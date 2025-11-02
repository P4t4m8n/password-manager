public interface IAuthService
{
    Task<AuthResponse> SignUpAsync(AuthSignUpDto authSignUpDto);
    Task<AuthResponse> SignInAsync(AuthSignInDto authSignInDto);
    Task SignOutAsync(string token);
}