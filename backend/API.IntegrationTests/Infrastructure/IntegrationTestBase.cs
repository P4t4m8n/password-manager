namespace API.IntegrationTests.Infrastructure;

/// <summary>
/// Base class for all integration tests.
/// Provides common setup, HTTP client, and helper methods.
/// </summary>
public abstract class IntegrationTestBase : IDisposable
{
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly HttpClient Client;
    protected readonly Guid TestUserId = Guid.NewGuid();

    protected IntegrationTestBase()
    {
        Factory = new CustomWebApplicationFactory();
        Client = Factory.CreateClient();
    }

    /// <summary>
    /// Adds authentication cookie to the client for authenticated requests.
    /// </summary>
    protected void AuthenticateClient()
    {
        Client.DefaultRequestHeaders.Add("Cookie", TestAuthHelper.CreateAuthCookie(TestUserId));
    }

    /// <summary>
    /// Adds authentication cookie for a specific user ID.
    /// </summary>
    protected void AuthenticateClientAs(Guid userId)
    {
        // Remove existing cookie header if present
        Client.DefaultRequestHeaders.Remove("Cookie");
        Client.DefaultRequestHeaders.Add("Cookie", TestAuthHelper.CreateAuthCookie(userId));
    }

    /// <summary>
    /// Clears authentication from the client.
    /// </summary>
    protected void ClearAuthentication()
    {
        Client.DefaultRequestHeaders.Remove("Cookie");
    }

    public void Dispose()
    {
        Client.Dispose();
        Factory.Dispose();
        GC.SuppressFinalize(this);
    }
}
