using API.Dtos.User;
using API.Enums;
using API.Exceptions;
using API.Interfaces;
using API.Models;
using API.Services;
using Dapper;
using Moq;

namespace API.UnitTests;

[TestClass]
public sealed class UserSettingsServiceTests
{
    private Mock<IDataContext> _mockDataContext = null!;
    private UserSettingsService _userSettingsService = null!;
    private Guid _testUserGuid;

    [TestInitialize]
    public void Setup()
    {
        _mockDataContext = new Mock<IDataContext>();
        _userSettingsService = new UserSettingsService(_mockDataContext.Object);
        _testUserGuid = Guid.NewGuid();
    }

    #region GetUserSettingsAsync Tests

    [TestMethod]
    public async Task GetUserSettingsAsync_WithValidUserId_ReturnsUserSettings()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(_testUserGuid, result.UserId);
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<UserSettings>(
            It.Is<string>(sql => sql.Contains("spUserSettings_Select_ByUserId")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_WhenNotFound_ThrowsException()
    {
        // Arrange
        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((UserSettings?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<Exception>(
            () => _userSettingsService.GetUserSettingsAsync(_testUserGuid));

        Assert.AreEqual("User Settings not found", exception.Message);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_MapsAllPropertiesCorrectly()
    {
        // Arrange
        var userSettings = new UserSettings
        {
            UserId = _testUserGuid,
            MasterPasswordTTLInMinutes = 30,
            AutoLockTimeInMinutes = 15,
            Theme = ThemeEnum.dark,
            MinimumPasswordStrength = PasswordStrengthEnum.strong,
            MasterPasswordStorageMode = StorageModeEnum.session,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            UpdatedAt = DateTime.UtcNow
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(userSettings.UserId, result.UserId);
        Assert.AreEqual(userSettings.MasterPasswordTTLInMinutes, result.MasterPasswordTTLInMinutes);
        Assert.AreEqual(userSettings.AutoLockTimeInMinutes, result.AutoLockTimeInMinutes);
        Assert.AreEqual(userSettings.Theme, result.Theme);
        Assert.AreEqual(userSettings.MinimumPasswordStrength, result.MinimumPasswordStrength);
        Assert.AreEqual(userSettings.MasterPasswordStorageMode, result.MasterPasswordStorageMode);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_WithLightTheme_ReturnsCorrectTheme()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);
        userSettings.Theme = ThemeEnum.light;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(ThemeEnum.light, result.Theme);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_WithDarkTheme_ReturnsCorrectTheme()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);
        userSettings.Theme = ThemeEnum.dark;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(ThemeEnum.dark, result.Theme);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_WithSystemTheme_ReturnsCorrectTheme()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);
        userSettings.Theme = ThemeEnum.system;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(ThemeEnum.system, result.Theme);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_WithWeakPasswordStrength_ReturnsCorrectStrength()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);
        userSettings.MinimumPasswordStrength = PasswordStrengthEnum.weak;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(PasswordStrengthEnum.weak, result.MinimumPasswordStrength);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_WithVeryStrongPasswordStrength_ReturnsCorrectStrength()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);
        userSettings.MinimumPasswordStrength = PasswordStrengthEnum.veryStrong;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(PasswordStrengthEnum.veryStrong, result.MinimumPasswordStrength);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_WithNoneStorageMode_ReturnsCorrectMode()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);
        userSettings.MasterPasswordStorageMode = StorageModeEnum.none;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(StorageModeEnum.none, result.MasterPasswordStorageMode);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_WithLocalStorageMode_ReturnsCorrectMode()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);
        userSettings.MasterPasswordStorageMode = StorageModeEnum.local;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(StorageModeEnum.local, result.MasterPasswordStorageMode);
    }

    #endregion

    #region UpdateUserSettingsAsync Tests

    [TestMethod]
    public async Task UpdateUserSettingsAsync_WithValidData_ReturnsUpdatedSettings()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(updateDto.UserId, result.UserId);
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
            It.Is<string>(sql => sql.Contains("spUserSettings_Update")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_WhenUpdateFails_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((UserSettingsDTO?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnexpectedCaughtException>(
            () => _userSettingsService.UpdateUserSettingsAsync(updateDto));

        Assert.AreEqual("Failed to update user settings", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "Update");
        Assert.AreEqual("No user settings were updated in the database.", exception.Errors["Update"]);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_UpdatesMasterPasswordTTL_ReturnsUpdatedValue()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.MasterPasswordTTLInMinutes = 60;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(60, result.MasterPasswordTTLInMinutes);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_UpdatesAutoLockTime_ReturnsUpdatedValue()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.AutoLockTimeInMinutes = 5;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(5, result.AutoLockTimeInMinutes);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesThemeToLight_ReturnsUpdatedTheme()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.Theme = ThemeEnum.light;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(ThemeEnum.light, result.Theme);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesThemeToDark_ReturnsUpdatedTheme()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.Theme = ThemeEnum.dark;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(ThemeEnum.dark, result.Theme);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesThemeToSystem_ReturnsUpdatedTheme()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.Theme = ThemeEnum.system;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(ThemeEnum.system, result.Theme);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesPasswordStrengthToWeak_ReturnsUpdatedStrength()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.MinimumPasswordStrength = PasswordStrengthEnum.weak;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(PasswordStrengthEnum.weak, result.MinimumPasswordStrength);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesPasswordStrengthToMedium_ReturnsUpdatedStrength()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.MinimumPasswordStrength = PasswordStrengthEnum.medium;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(PasswordStrengthEnum.medium, result.MinimumPasswordStrength);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesPasswordStrengthToStrong_ReturnsUpdatedStrength()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.MinimumPasswordStrength = PasswordStrengthEnum.strong;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(PasswordStrengthEnum.strong, result.MinimumPasswordStrength);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesPasswordStrengthToVeryStrong_ReturnsUpdatedStrength()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.MinimumPasswordStrength = PasswordStrengthEnum.veryStrong;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(PasswordStrengthEnum.veryStrong, result.MinimumPasswordStrength);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesStorageModeToNone_ReturnsUpdatedMode()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.MasterPasswordStorageMode = StorageModeEnum.none;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(StorageModeEnum.none, result.MasterPasswordStorageMode);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesStorageModeToSession_ReturnsUpdatedMode()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.MasterPasswordStorageMode = StorageModeEnum.session;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(StorageModeEnum.session, result.MasterPasswordStorageMode);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_ChangesStorageModeToLocal_ReturnsUpdatedMode()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.MasterPasswordStorageMode = StorageModeEnum.local;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(StorageModeEnum.local, result.MasterPasswordStorageMode);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_UpdatesAllSettings_ReturnsCompletelyUpdatedSettings()
    {
        // Arrange
        var updateDto = new UserSettingsDTO
        {
            UserId = _testUserGuid,
            MasterPasswordTTLInMinutes = 120,
            AutoLockTimeInMinutes = 30,
            Theme = ThemeEnum.dark,
            MinimumPasswordStrength = PasswordStrengthEnum.veryStrong,
            MasterPasswordStorageMode = StorageModeEnum.local
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(updateDto.UserId, result.UserId);
        Assert.AreEqual(updateDto.MasterPasswordTTLInMinutes, result.MasterPasswordTTLInMinutes);
        Assert.AreEqual(updateDto.AutoLockTimeInMinutes, result.AutoLockTimeInMinutes);
        Assert.AreEqual(updateDto.Theme, result.Theme);
        Assert.AreEqual(updateDto.MinimumPasswordStrength, result.MinimumPasswordStrength);
        Assert.AreEqual(updateDto.MasterPasswordStorageMode, result.MasterPasswordStorageMode);
    }

    #endregion

    #region Edge Cases Tests

    [TestMethod]
    public async Task GetUserSettingsAsync_WithZeroTimerValues_ReturnsCorrectValues()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);
        userSettings.MasterPasswordTTLInMinutes = 0;
        userSettings.AutoLockTimeInMinutes = 0;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(0, result.MasterPasswordTTLInMinutes);
        Assert.AreEqual(0, result.AutoLockTimeInMinutes);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_WithMaxTimerValues_ReturnsCorrectValues()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);
        userSettings.MasterPasswordTTLInMinutes = int.MaxValue;
        userSettings.AutoLockTimeInMinutes = int.MaxValue;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        var result = await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(int.MaxValue, result.MasterPasswordTTLInMinutes);
        Assert.AreEqual(int.MaxValue, result.AutoLockTimeInMinutes);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_WithMinimumTTL_UpdatesSuccessfully()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);
        updateDto.MasterPasswordTTLInMinutes = 1;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        var result = await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        Assert.AreEqual(1, result.MasterPasswordTTLInMinutes);
    }

    [TestMethod]
    public async Task UpdateUserSettingsAsync_CallsStoredProcedureWithCorrectParameters()
    {
        // Arrange
        var updateDto = CreateTestUserSettingsDTO(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(updateDto);

        // Act
        await _userSettingsService.UpdateUserSettingsAsync(updateDto);

        // Assert
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<UserSettingsDTO>(
            It.Is<string>(sql =>
                sql.Contains("spUserSettings_Update") &&
                sql.Contains("@UserId") &&
                sql.Contains("@MasterPasswordTTLInMinutes") &&
                sql.Contains("@AutoLockTimeInMinutes") &&
                sql.Contains("@Theme") &&
                sql.Contains("@MinimumPasswordStrength") &&
                sql.Contains("@MasterPasswordStorageMode")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task GetUserSettingsAsync_CallsStoredProcedureWithCorrectParameters()
    {
        // Arrange
        var userSettings = CreateTestUserSettings(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<UserSettings>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(userSettings);

        // Act
        await _userSettingsService.GetUserSettingsAsync(_testUserGuid);

        // Assert
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<UserSettings>(
            It.Is<string>(sql =>
                sql.Contains("spUserSettings_Select_ByUserId") &&
                sql.Contains("@UserId")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    #endregion

    #region Helper Methods

    private static UserSettings CreateTestUserSettings(Guid userId)
    {
        return new UserSettings
        {
            UserId = userId,
            MasterPasswordTTLInMinutes = 30,
            AutoLockTimeInMinutes = 15,
            Theme = ThemeEnum.system,
            MinimumPasswordStrength = PasswordStrengthEnum.medium,
            MasterPasswordStorageMode = StorageModeEnum.session,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static UserSettingsDTO CreateTestUserSettingsDTO(Guid userId)
    {
        return new UserSettingsDTO
        {
            UserId = userId,
            MasterPasswordTTLInMinutes = 30,
            AutoLockTimeInMinutes = 15,
            Theme = ThemeEnum.system,
            MinimumPasswordStrength = PasswordStrengthEnum.medium,
            MasterPasswordStorageMode = StorageModeEnum.session,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
