public class AuthSignUpDto : AuthSignInDto
{
    public string? Username { get; set; }
    public string? ConfirmPassword { get; set; }

}
