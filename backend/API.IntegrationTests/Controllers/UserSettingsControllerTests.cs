using System.Net;
using System.Net.Http.Json;
using API.Dtos.Http;
using API.Dtos.User;
using API.Enums;
using API.IntegrationTests.Infrastructure;
using Moq;

namespace API.IntegrationTests.Controllers;

[TestClass]
public class UserSettingsControllerTests : IntegrationTestBase
{
    #region GET /api/User-settings Tests

    [TestMethod]
    public async Task GetUserSettings_WhenAuthenticated_Returns200WithSettings()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedSettings = new UserSettingsDTO
        {
            UserId = userId,
            MasterPasswordTTLInMinutes = 30,
            AutoLockTimeInMinutes = 5,
            Theme = ThemeEnum.dark,
            MinimumPasswordStrength = PasswordStrengthEnum.strong,
            MasterPasswordStorageMode = StorageModeEnum.session,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            UpdatedAt = DateTime.UtcNow
        };

        Factory.MockUserSettingsService
            .Setup(x => x.GetUserSettingsAsync(It.IsAny<Guid>()))
            .ReturnsAsync(expectedSettings);

        AuthenticateClientAs(userId);

        // Act
        var response = await Client.GetAsync("/api/User-settings");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<UserSettingsDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual(200, result.StatusCode);
        Assert.IsNotNull(result.Data);
        Assert.AreEqual(ThemeEnum.dark, result.Data.Theme);
        Assert.AreEqual(30, result.Data.MasterPasswordTTLInMinutes);
    }

    [TestMethod]
    public async Task GetUserSettings_WhenNotAuthenticated_Returns401()
    {
        // Arrange - No authentication

        // Act
        var response = await Client.GetAsync("/api/User-settings");

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task GetUserSettings_WithDifferentThemes_ReturnsCorrectTheme()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedSettings = new UserSettingsDTO
        {
            UserId = userId,
            Theme = ThemeEnum.light,
            MasterPasswordTTLInMinutes = 60,
            AutoLockTimeInMinutes = 10,
            MinimumPasswordStrength = PasswordStrengthEnum.medium,
            MasterPasswordStorageMode = StorageModeEnum.local
        };

        Factory.MockUserSettingsService
            .Setup(x => x.GetUserSettingsAsync(It.IsAny<Guid>()))
            .ReturnsAsync(expectedSettings);

        AuthenticateClientAs(userId);

        // Act
        var response = await Client.GetAsync("/api/User-settings");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<UserSettingsDTO>>();
        Assert.IsNotNull(result?.Data);
        Assert.AreEqual(ThemeEnum.light, result.Data.Theme);
    }

    #endregion

    #region PUT /api/User-settings Tests

    [TestMethod]
    public async Task UpdateUserSettings_WithValidData_Returns200()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var settingsToUpdate = new UserSettingsDTO
        {
            UserId = userId,
            MasterPasswordTTLInMinutes = 45,
            AutoLockTimeInMinutes = 15,
            Theme = ThemeEnum.dark,
            MinimumPasswordStrength = PasswordStrengthEnum.veryStrong,
            MasterPasswordStorageMode = StorageModeEnum.session
        };

        Factory.MockUserSettingsService
            .Setup(x => x.UpdateUserSettingsAsync(It.IsAny<UserSettingsDTO>()))
            .ReturnsAsync(settingsToUpdate);

        AuthenticateClientAs(userId);

        // Act
        var response = await Client.PutAsJsonAsync("/api/User-settings", settingsToUpdate);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<UserSettingsDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("User settings updated successfully.", result.Message);
    }

    [TestMethod]
    public async Task UpdateUserSettings_WhenNotAuthenticated_Returns401()
    {
        // Arrange
        var settingsToUpdate = new UserSettingsDTO
        {
            MasterPasswordTTLInMinutes = 45,
            AutoLockTimeInMinutes = 15,
            Theme = ThemeEnum.dark
        };

        // Act
        var response = await Client.PutAsJsonAsync("/api/User-settings", settingsToUpdate);

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task UpdateUserSettings_SetsUserIdFromToken()
    {
        // Arrange
        var userId = Guid.NewGuid();
        UserSettingsDTO? capturedSettings = null;

        Factory.MockUserSettingsService
            .Setup(x => x.UpdateUserSettingsAsync(It.IsAny<UserSettingsDTO>()))
            .Callback<UserSettingsDTO>(s => capturedSettings = s)
            .ReturnsAsync((UserSettingsDTO s) => s);

        AuthenticateClientAs(userId);

        var settingsToUpdate = new UserSettingsDTO
        {
            UserId = Guid.Empty, // Should be overwritten by controller
            MasterPasswordTTLInMinutes = 30,
            AutoLockTimeInMinutes = 5,
            Theme = ThemeEnum.light
        };

        // Act
        await Client.PutAsJsonAsync("/api/User-settings", settingsToUpdate);

        // Assert
        Assert.IsNotNull(capturedSettings);
        Assert.AreEqual(userId, capturedSettings.UserId);
    }

    [TestMethod]
    public async Task UpdateUserSettings_WithAllStorageModes_Succeeds()
    {
        // Arrange
        var userId = Guid.NewGuid();

        Factory.MockUserSettingsService
            .Setup(x => x.UpdateUserSettingsAsync(It.IsAny<UserSettingsDTO>()))
            .ReturnsAsync((UserSettingsDTO s) => s);

        AuthenticateClientAs(userId);

        var storageModes = new[] { StorageModeEnum.local, StorageModeEnum.session, StorageModeEnum.none };

        foreach (var storageMode in storageModes)
        {
            var settingsToUpdate = new UserSettingsDTO
            {
                MasterPasswordTTLInMinutes = 30,
                AutoLockTimeInMinutes = 5,
                Theme = ThemeEnum.dark,
                MinimumPasswordStrength = PasswordStrengthEnum.strong,
                MasterPasswordStorageMode = storageMode
            };

            // Act
            var response = await Client.PutAsJsonAsync("/api/User-settings", settingsToUpdate);

            // Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode, $"Failed for StorageMode: {storageMode}");
        }
    }

    [TestMethod]
    public async Task UpdateUserSettings_WithAllPasswordStrengths_Succeeds()
    {
        // Arrange
        var userId = Guid.NewGuid();

        Factory.MockUserSettingsService
            .Setup(x => x.UpdateUserSettingsAsync(It.IsAny<UserSettingsDTO>()))
            .ReturnsAsync((UserSettingsDTO s) => s);

        AuthenticateClientAs(userId);

        var strengths = new[] 
        { 
            PasswordStrengthEnum.weak, 
            PasswordStrengthEnum.medium, 
            PasswordStrengthEnum.strong, 
            PasswordStrengthEnum.veryStrong 
        };

        foreach (var strength in strengths)
        {
            var settingsToUpdate = new UserSettingsDTO
            {
                MasterPasswordTTLInMinutes = 30,
                AutoLockTimeInMinutes = 5,
                Theme = ThemeEnum.dark,
                MinimumPasswordStrength = strength,
                MasterPasswordStorageMode = StorageModeEnum.session
            };

            // Act
            var response = await Client.PutAsJsonAsync("/api/User-settings", settingsToUpdate);

            // Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode, $"Failed for PasswordStrength: {strength}");
        }
    }

    #endregion
}
