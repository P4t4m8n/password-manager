using System.Security.Claims;
using API.Exceptions;

namespace API.Extensions
{
    public static class ClaimsExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            string? userId = user.FindFirstValue("userId");

            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedException("User not authenticated", new Dictionary<string, string>
                {
                    { "Authentication", "No valid authentication token found" }
                });
            }

            if (!Guid.TryParse(userId, out Guid userGuid))
            {
                throw new UnauthorizedException("Invalid User ID format", new Dictionary<string, string>
                {
                    { "Authentication", "Token ID is not a valid GUID" }
                });
            }

            return userGuid;
        }
    }
}