using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace API.IntegrationTests.Infrastructure;

/// <summary>
/// Helper class to generate JWT tokens for authenticated test requests.
/// </summary>
public static class TestAuthHelper
{
    // Must match the key in your test configuration
    private const string TestTokenKey = "ThisIsAVeryLongTokenKeyThatMustBeAtLeast64BytesLongForHmacSha512AlgorithmToWork!!!";

    /// <summary>
    /// Creates a valid JWT token for testing authenticated endpoints.
    /// </summary>
    public static string CreateTestToken(Guid userId)
    {
        var claims = new[] { new Claim("userId", userId.ToString()) };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestTokenKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(1),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Creates a cookie header value with the auth token.
    /// </summary>
    public static string CreateAuthCookie(Guid userId)
    {
        return $"AuthToken={CreateTestToken(userId)}";
    }
}
