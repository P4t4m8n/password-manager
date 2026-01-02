using API.Dtos.Auth;
using API.Dtos.User;
using API.Enums;
using API.Exceptions;
using API.Interfaces;
using API.Models;
using API.Services;
using Dapper;
using Microsoft.AspNetCore.Http;
using Moq;

namespace API.UnitTests;

[TestClass]
public sealed class AuthServiceTests
{
    private Mock<IDataContext> _mockDataContext = null!;
    private Mock<ICryptoService> _mockCryptoService = null!;
    private AuthService _authService = null!;
    private Mock<HttpResponse> _mockHttpResponse = null!;
    private Mock<IResponseCookies> _mockCookies = null!;
    private Guid _testUserGuid;

    [TestInitialize]
    public void Setup()
    {
        _mockDataContext = new Mock<IDataContext>();
        _mockCryptoService = new Mock<ICryptoService>();
        _mockHttpResponse = new Mock<HttpResponse>();
        _mockCookies = new Mock<IResponseCookies>();

        _mockHttpResponse.Setup(r => r.Cookies).Returns(_mockCookies.Object);

        _authService = new AuthService(_mockDataContext.Object, _mockCryptoService.Object);
        _testUserGuid = Guid.NewGuid();
    }

    #region SignInAsync Tests

    [TestMethod]
    public async Task SignInAsync_WithValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var passwordSalt = new byte[] { 1, 2, 3, 4 };
        var passwordHash = new byte[] { 5, 6, 7, 8 };

        var authConfirmation = new AuthConfirmationDTO
        {
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt
        };

        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<AuthConfirmationDTO>(
                It.Is<string>(sql => sql.Contains("spFor_Hash")),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(authConfirmation);

        _mockCryptoService
            .Setup(x => x.GetPasswordHash(signInDto.Password, passwordSalt))
            .Returns(passwordHash);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.Is<string>(sql => sql.Contains("spUser_GetOne")),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        _mockCryptoService
            .Setup(x => x.CreateToken(It.IsAny<string>()))
            .Returns("mock-token");

        // Act
        var result = await _authService.SignInAsync(signInDto, _mockHttpResponse.Object);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(userWithSettings.Id, result.User?.Id);
        Assert.AreEqual(userWithSettings.Email, result.User?.Email);
        _mockCookies.Verify(x => x.Append("AuthToken", "mock-token", It.IsAny<CookieOptions>()), Times.Once);
    }

    [TestMethod]
    public async Task SignInAsync_WithInvalidPassword_ThrowsUnauthorizedException()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = "wrongpassword"
        };

        var passwordSalt = new byte[] { 1, 2, 3, 4 };
        var correctHash = new byte[] { 5, 6, 7, 8 };
        var wrongHash = new byte[] { 9, 10, 11, 12 };

        var authConfirmation = new AuthConfirmationDTO
        {
            PasswordHash = correctHash,
            PasswordSalt = passwordSalt
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<AuthConfirmationDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(authConfirmation);

        _mockCryptoService
            .Setup(x => x.GetPasswordHash(signInDto.Password, passwordSalt))
            .Returns(wrongHash);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnauthorizedException>(
            () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));

        Assert.AreEqual("Invalid email or password", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "Email");
        CollectionAssert.Contains(exception.Errors.Keys, "Password");
    }

    [TestMethod]
    public async Task SignInAsync_WithNonExistentEmail_ThrowsUnauthorizedException()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = "nonexistent@example.com",
            Password = "password123"
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<AuthConfirmationDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((AuthConfirmationDTO?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnauthorizedException>(
            () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));

        Assert.AreEqual("Invalid email or password", exception.Message);
    }

    [TestMethod]
    public async Task SignInAsync_WithNullPassword_ThrowsUnauthorizedException()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = null
        };

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnauthorizedException>(
            () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));

        Assert.AreEqual("Invalid email or password", exception.Message);
    }

    [TestMethod]
    public async Task SignInAsync_WithNullEmail_ThrowsUnauthorizedException()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = null,
            Password = "password123"
        };

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnauthorizedException>(
            () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));

        Assert.AreEqual("Invalid email or password", exception.Message);
    }

    [TestMethod]
    public async Task SignInAsync_WithEmptyPassword_ThrowsUnauthorizedException()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = ""
        };

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnauthorizedException>(
            () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));

        Assert.AreEqual("Invalid email or password", exception.Message);
    }

    [TestMethod]
    public async Task SignInAsync_WhenUserNotFoundAfterAuth_ThrowsNotFoundException()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var passwordSalt = new byte[] { 1, 2, 3, 4 };
        var passwordHash = new byte[] { 5, 6, 7, 8 };

        var authConfirmation = new AuthConfirmationDTO
        {
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<AuthConfirmationDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(authConfirmation);

        _mockCryptoService
            .Setup(x => x.GetPasswordHash(signInDto.Password, passwordSalt))
            .Returns(passwordHash);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync((UserWithSettings?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));

        Assert.AreEqual("User not found after successful authentication", exception.Message);
    }

    [TestMethod]
    public async Task SignInAsync_SetsAuthCookieWithCorrectOptions()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var passwordSalt = new byte[] { 1, 2, 3, 4 };
        var passwordHash = new byte[] { 5, 6, 7, 8 };

        var authConfirmation = new AuthConfirmationDTO
        {
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt
        };

        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);

        SetupSuccessfulSignIn(authConfirmation, passwordHash, passwordSalt, userWithSettings, signInDto.Password!);

        // Act
        await _authService.SignInAsync(signInDto, _mockHttpResponse.Object);

        // Assert
        _mockCookies.Verify(x => x.Append(
            "AuthToken",
            It.IsAny<string>(),
            It.Is<CookieOptions>(opts =>
                opts.HttpOnly == true &&
                opts.Secure == true &&
                opts.SameSite == SameSiteMode.Strict)),
            Times.Once);
    }

    #endregion

    #region SignUpAsync Tests

    [TestMethod]
    public async Task SignUpAsync_WithValidData_ReturnsAuthResponse()
    {
        // Arrange
        var signUpDto = CreateTestSignUpDTO();
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);
        var generatedSalt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 };
        var generatedHash = new byte[] { 10, 11, 12, 13, 14, 15, 16, 17 };

        _mockDataContext
            .Setup(x => x.LoadData<string>(
                It.Is<string>(sql => sql.Contains("spFor_Existing")),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string>());

        _mockCryptoService
            .Setup(x => x.GenerateSalt())
            .Returns(generatedSalt);

        _mockCryptoService
            .Setup(x => x.GetPasswordHash(signUpDto.Password!, generatedSalt))
            .Returns(generatedHash);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.Is<string>(sql => sql.Contains("spUser_Create")),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        _mockCryptoService
            .Setup(x => x.CreateToken(It.IsAny<string>()))
            .Returns("mock-token");

        // Act
        var result = await _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(userWithSettings.Id, result.User?.Id);
        Assert.AreEqual(userWithSettings.Email, result.User?.Email);
        _mockCookies.Verify(x => x.Append("AuthToken", "mock-token", It.IsAny<CookieOptions>()), Times.Once);
    }

    [TestMethod]
    public async Task SignUpAsync_WhenEmailAlreadyExists_ThrowsUserAlreadyExistsException()
    {
        // Arrange
        var signUpDto = CreateTestSignUpDTO();

        _mockDataContext
            .Setup(x => x.LoadData<string>(
                It.Is<string>(sql => sql.Contains("spFor_Existing")),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string> { "existing@example.com" });

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UserAlreadyExistsException>(
            () => _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object));

        Assert.AreEqual("A user with the provided email already exists.", exception.Message);
    }

    [TestMethod]
    public async Task SignUpAsync_WithNullEmail_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        var signUpDto = CreateTestSignUpDTO();
        signUpDto.Email = null;

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnexpectedCaughtException>(
            () => _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object));

        Assert.AreEqual("Email is null during user existence check", exception.Message);
    }

    [TestMethod]
    public async Task SignUpAsync_WithNullPassword_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        var signUpDto = CreateTestSignUpDTO();
        signUpDto.Password = null;

        _mockDataContext
            .Setup(x => x.LoadData<string>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string>());

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnexpectedCaughtException>(
            () => _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object));

        Assert.AreEqual("Password or email is null during user creation", exception.Message);
    }

    [TestMethod]
    public async Task SignUpAsync_WhenUserCreationFails_ThrowsUserCreationFailedException()
    {
        // Arrange
        var signUpDto = CreateTestSignUpDTO();
        var generatedSalt = new byte[] { 1, 2, 3, 4 };
        var generatedHash = new byte[] { 5, 6, 7, 8 };

        _mockDataContext
            .Setup(x => x.LoadData<string>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string>());

        _mockCryptoService.Setup(x => x.GenerateSalt()).Returns(generatedSalt);
        _mockCryptoService.Setup(x => x.GetPasswordHash(signUpDto.Password!, generatedSalt)).Returns(generatedHash);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync((UserWithSettings?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UserCreationFailedException>(
            () => _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object));

        Assert.AreEqual("Failed to create user due to a server error.", exception.Message);
    }

    [TestMethod]
    public async Task SignUpAsync_WhenUserCreatedWithEmptyGuid_ThrowsUserCreationFailedException()
    {
        // Arrange
        var signUpDto = CreateTestSignUpDTO();
        var generatedSalt = new byte[] { 1, 2, 3, 4 };
        var generatedHash = new byte[] { 5, 6, 7, 8 };
        var userWithEmptyGuid = CreateTestUserWithSettings(Guid.Empty);

        _mockDataContext
            .Setup(x => x.LoadData<string>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string>());

        _mockCryptoService.Setup(x => x.GenerateSalt()).Returns(generatedSalt);
        _mockCryptoService.Setup(x => x.GetPasswordHash(signUpDto.Password!, generatedSalt)).Returns(generatedHash);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithEmptyGuid);

        // Act & Assert
        await Assert.ThrowsExceptionAsync<UserCreationFailedException>(
            () => _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object));
    }

    [TestMethod]
    public async Task SignUpAsync_CallsGenerateSalt()
    {
        // Arrange
        var signUpDto = CreateTestSignUpDTO();
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);
        var generatedSalt = new byte[] { 1, 2, 3, 4 };
        var generatedHash = new byte[] { 5, 6, 7, 8 };

        _mockDataContext
            .Setup(x => x.LoadData<string>(It.IsAny<string>(), It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string>());

        _mockCryptoService.Setup(x => x.GenerateSalt()).Returns(generatedSalt);
        _mockCryptoService.Setup(x => x.GetPasswordHash(signUpDto.Password!, generatedSalt)).Returns(generatedHash);
        _mockCryptoService.Setup(x => x.CreateToken(It.IsAny<string>())).Returns("token");

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        // Act
        await _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object);

        // Assert
        _mockCryptoService.Verify(x => x.GenerateSalt(), Times.Once);
    }

    [TestMethod]
    public async Task SignUpAsync_CallsGetPasswordHashWithCorrectParams()
    {
        // Arrange
        var signUpDto = CreateTestSignUpDTO();
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);
        var generatedSalt = new byte[] { 1, 2, 3, 4 };
        var generatedHash = new byte[] { 5, 6, 7, 8 };

        _mockDataContext
            .Setup(x => x.LoadData<string>(It.IsAny<string>(), It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string>());

        _mockCryptoService.Setup(x => x.GenerateSalt()).Returns(generatedSalt);
        _mockCryptoService.Setup(x => x.GetPasswordHash(signUpDto.Password!, generatedSalt)).Returns(generatedHash);
        _mockCryptoService.Setup(x => x.CreateToken(It.IsAny<string>())).Returns("token");

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        // Act
        await _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object);

        // Assert
        _mockCryptoService.Verify(x => x.GetPasswordHash(signUpDto.Password!, generatedSalt), Times.Once);
    }

    #endregion

    #region CheckSessionAsync Tests

    [TestMethod]
    public async Task CheckSessionAsync_WithValidUserGuid_ReturnsAuthResponse()
    {
        // Arrange
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.Is<string>(sql => sql.Contains("spUser_GetOne")),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        // Act
        var result = await _authService.CheckSessionAsync(_testUserGuid);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(userWithSettings.Id, result.User?.Id);
        Assert.AreEqual(userWithSettings.Email, result.User?.Email);
        Assert.AreEqual(userWithSettings.Username, result.User?.Username);
    }

    [TestMethod]
    public async Task CheckSessionAsync_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync((UserWithSettings?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _authService.CheckSessionAsync(_testUserGuid));

        Assert.AreEqual("User not found", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "User");
    }

    [TestMethod]
    public async Task CheckSessionAsync_ReturnsCorrectUserSettings()
    {
        // Arrange
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);
        userWithSettings.Settings.Theme = ThemeEnum.dark;
        userWithSettings.Settings.MinimumPasswordStrength = PasswordStrengthEnum.veryStrong;

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        // Act
        var result = await _authService.CheckSessionAsync(_testUserGuid);

        // Assert
        Assert.IsNotNull(result.User?.Settings);
        Assert.AreEqual(ThemeEnum.dark, result.User.Settings.Theme);
        Assert.AreEqual(PasswordStrengthEnum.veryStrong, result.User.Settings.MinimumPasswordStrength);
    }

    [TestMethod]
    public async Task CheckSessionAsync_DoesNotSetCookie()
    {
        // Arrange
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        // Act
        await _authService.CheckSessionAsync(_testUserGuid);

        // Assert - No cookie operations should happen
        _mockCookies.Verify(x => x.Append(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CookieOptions>()), Times.Never);
    }

    #endregion

    #region RefreshTokenAsync Tests

    [TestMethod]
    public async Task RefreshTokenAsync_WithValidUserGuid_ReturnsAuthResponseAndSetsCookie()
    {
        // Arrange
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.Is<string>(sql => sql.Contains("spUser_GetOne")),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        _mockCryptoService
            .Setup(x => x.CreateToken(It.IsAny<string>()))
            .Returns("refreshed-token");

        // Act
        var result = await _authService.RefreshTokenAsync(_testUserGuid, _mockHttpResponse.Object);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(userWithSettings.Id, result.User?.Id);
        _mockCookies.Verify(x => x.Append("AuthToken", "refreshed-token", It.IsAny<CookieOptions>()), Times.Once);
    }

    [TestMethod]
    public async Task RefreshTokenAsync_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync((UserWithSettings?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _authService.RefreshTokenAsync(_testUserGuid, _mockHttpResponse.Object));

        Assert.AreEqual("User not found", exception.Message);
    }

    [TestMethod]
    public async Task RefreshTokenAsync_CallsCreateTokenWithUserId()
    {
        // Arrange
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        _mockCryptoService
            .Setup(x => x.CreateToken(It.IsAny<string>()))
            .Returns("token");

        // Act
        await _authService.RefreshTokenAsync(_testUserGuid, _mockHttpResponse.Object);

        // Assert
        _mockCryptoService.Verify(x => x.CreateToken(_testUserGuid.ToString()), Times.Once);
    }

    [TestMethod]
    public async Task RefreshTokenAsync_SetsCookieWithCorrectExpiration()
    {
        // Arrange
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        _mockCryptoService
            .Setup(x => x.CreateToken(It.IsAny<string>()))
            .Returns("token");

        // Act
        await _authService.RefreshTokenAsync(_testUserGuid, _mockHttpResponse.Object);

        // Assert
        _mockCookies.Verify(x => x.Append(
            "AuthToken",
            It.IsAny<string>(),
            It.Is<CookieOptions>(opts => opts.Expires.HasValue)),
            Times.Once);
    }

    #endregion

    #region AuthResponse Tests

    [TestMethod]
    public async Task SignInAsync_ReturnsAuthResponseWithMasterPasswordSalt()
    {
        // Arrange
        var signInDto = new AuthSignInDTO { Email = "test@example.com", Password = "password123" };
        var passwordSalt = new byte[] { 1, 2, 3, 4 };
        var passwordHash = new byte[] { 5, 6, 7, 8 };
        var masterPasswordSalt = new byte[] { 20, 21, 22, 23, 24, 25, 26, 27 };

        var authConfirmation = new AuthConfirmationDTO { PasswordHash = passwordHash, PasswordSalt = passwordSalt };
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);
        userWithSettings.MasterPasswordSalt = masterPasswordSalt;

        SetupSuccessfulSignIn(authConfirmation, passwordHash, passwordSalt, userWithSettings, signInDto.Password!);

        // Act
        var result = await _authService.SignInAsync(signInDto, _mockHttpResponse.Object);

        // Assert
        CollectionAssert.AreEqual(masterPasswordSalt, result.MasterPasswordSalt);
    }

    [TestMethod]
    public async Task CheckSessionAsync_ReturnsAuthResponseWithAllUserSettingsFields()
    {
        // Arrange
        var userWithSettings = CreateTestUserWithSettings(_testUserGuid);
        userWithSettings.Settings.MasterPasswordTTLInMinutes = 60;
        userWithSettings.Settings.AutoLockTimeInMinutes = 30;
        userWithSettings.Settings.MasterPasswordStorageMode = StorageModeEnum.local;

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        // Act
        var result = await _authService.CheckSessionAsync(_testUserGuid);

        // Assert
        Assert.IsNotNull(result.User?.Settings);
        Assert.AreEqual(60, result.User.Settings.MasterPasswordTTLInMinutes);
        Assert.AreEqual(30, result.User.Settings.AutoLockTimeInMinutes);
        Assert.AreEqual(StorageModeEnum.local, result.User.Settings.MasterPasswordStorageMode);
    }

    #endregion

    #region Edge Cases Tests

    [TestMethod]
    public async Task SignInAsync_WithFirstByteHashMismatch_ThrowsUnauthorizedException()
    {
        // Arrange
        var signInDto = new AuthSignInDTO { Email = "test@example.com", Password = "password123" };
        var passwordSalt = new byte[] { 1, 2, 3, 4 };
        var storedHash = new byte[] { 5, 6, 7, 8 }; 
        var computedHash = new byte[] { 99, 6, 7, 8 }; // First byte different

        var authConfirmation = new AuthConfirmationDTO
        {
            PasswordHash = storedHash,
            PasswordSalt = passwordSalt
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<AuthConfirmationDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(authConfirmation);

        _mockCryptoService
            .Setup(x => x.GetPasswordHash(signInDto.Password, passwordSalt))
            .Returns(computedHash);

        // Act & Assert
        await Assert.ThrowsExceptionAsync<UnauthorizedException>(
            () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));
    }

    [TestMethod]
    public async Task SignUpAsync_WithEmptyPassword_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        var signUpDto = CreateTestSignUpDTO();
        signUpDto.Password = "";

        _mockDataContext
            .Setup(x => x.LoadData<string>(It.IsAny<string>(), It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string>());

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnexpectedCaughtException>(
            () => _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object));

        Assert.AreEqual("Password or email is null during user creation", exception.Message);
    }

    #endregion

    #region Helper Methods

    private void SetupSuccessfulSignIn(AuthConfirmationDTO authConfirmation, byte[] passwordHash, byte[] passwordSalt, UserWithSettings userWithSettings, string password)
    {
        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<AuthConfirmationDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(authConfirmation);

        _mockCryptoService
            .Setup(x => x.GetPasswordHash(password, passwordSalt))
            .Returns(passwordHash);

        _mockDataContext
            .Setup(x => x.QueryAsyncTwoSplit<User, UserSettings, UserWithSettings>(
                It.IsAny<string>(),
                It.IsAny<Func<User, UserSettings, UserWithSettings>>(),
                It.IsAny<DynamicParameters?>(),
                It.IsAny<string>()))
            .ReturnsAsync(userWithSettings);

        _mockCryptoService
            .Setup(x => x.CreateToken(It.IsAny<string>()))
            .Returns("mock-token");
    }

    private static UserWithSettings CreateTestUserWithSettings(Guid userId)
    {
        return new UserWithSettings
        {
            Id = userId,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword",
            PasswordSalt = new byte[] { 1, 2, 3, 4 },
            MasterPasswordSalt = new byte[] { 10, 11, 12, 13, 14, 15, 16, 17 },
            EncryptedMasterKeyWithRecovery = new byte[] { 20, 21, 22, 23 },
            RecoveryIV = new byte[] { 30, 31, 32, 33 },
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            UpdatedAt = DateTime.UtcNow,
            Settings = new UserSettings
            {
                UserId = userId,
                MasterPasswordTTLInMinutes = 30,
                AutoLockTimeInMinutes = 15,
                Theme = ThemeEnum.system,
                MinimumPasswordStrength = PasswordStrengthEnum.medium,
                MasterPasswordStorageMode = StorageModeEnum.session,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                UpdatedAt = DateTime.UtcNow
            }
        };
    }

    private static AuthSignUpDTO CreateTestSignUpDTO()
    {
        return new AuthSignUpDTO
        {
            Email = "newuser@example.com",
            Password = "SecurePassword123!",
            ConfirmPassword = "SecurePassword123!",
            Username = "newuser",
            MasterPasswordSalt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 },
            EncryptedMasterKeyWithRecovery = new byte[] { 10, 11, 12, 13, 14, 15, 16, 17 },
            RecoveryIV = new byte[] { 20, 21, 22, 23, 24, 25, 26, 27 }
        };
    }

    #endregion
}
