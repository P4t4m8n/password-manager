using API.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace API.IntegrationTests.Infrastructure;

/// <summary>
/// Custom WebApplicationFactory that allows mocking services for integration tests.
/// This creates an in-memory test server with your API.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    // Store mocks so tests can configure them
    public Mock<IDataContext> MockDataContext { get; } = new();
    public Mock<ICryptoService> MockCryptoService { get; } = new();
    public Mock<IAuthService> MockAuthService { get; } = new();
    public Mock<IPasswordEntryService> MockPasswordEntryService { get; } = new();
    public Mock<IUserSettingsService> MockUserSettingsService { get; } = new();
    public Mock<IUserMasterPasswordService> MockMasterPasswordRecoveryService { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // Add in-memory configuration with test values for JWT
        var testConfig = new Dictionary<string, string?>
        {
            ["Crypto:TokenKey"] = "ThisIsAVeryLongTokenKeyThatMustBeAtLeast64BytesLongForHmacSha512AlgorithmToWork!!!",
            ["Crypto:PasswordKey"] = "TestPasswordKey123!@#",
            ["ConnectionStrings:DefaultConnection"] = ""
        };

        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(testConfig);
        });

        builder.ConfigureServices(services =>
        {
            // Remove existing service registrations
            RemoveService<IDataContext>(services);
            RemoveService<ICryptoService>(services);
            RemoveService<IAuthService>(services);
            RemoveService<IPasswordEntryService>(services);
            RemoveService<IUserSettingsService>(services);
            RemoveService<IUserMasterPasswordService>(services);

            // Add mocked services
            services.AddScoped(_ => MockDataContext.Object);
            services.AddScoped(_ => MockCryptoService.Object);
            services.AddScoped(_ => MockAuthService.Object);
            services.AddScoped(_ => MockPasswordEntryService.Object);
            services.AddScoped(_ => MockUserSettingsService.Object);
            services.AddScoped(_ => MockMasterPasswordRecoveryService.Object);
        });
    }

    private static void RemoveService<T>(IServiceCollection services)
    {
        var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(T));
        if (descriptor != null)
        {
            services.Remove(descriptor);
        }
    }
}
