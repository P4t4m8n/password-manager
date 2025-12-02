using API.Dtos.Auth;
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

    [TestInitialize]
    public void Setup()
    {
        _mockDataContext = new Mock<IDataContext>();
        _mockCryptoService = new Mock<ICryptoService>();
        _mockHttpResponse = new Mock<HttpResponse>();
        _mockCookies = new Mock<IResponseCookies>();

        _mockHttpResponse.Setup(r => r.Cookies).Returns(_mockCookies.Object);

        _authService = new AuthService(_mockDataContext.Object, _mockCryptoService.Object);
    }

    #region SignInAsync Tests

    [TestMethod]
    public async Task SignInAsync_WithValidCredentials_ReturnsAuthResponse()
    {

        AuthSignInDTO signInDto = new()
        {
            Email = "test@example.com",
            Password = "password123"
        };

        byte[] passwordSalt = [1, 2, 3, 4];
        byte[] passwordHash = [5, 6, 7, 8];

        AuthConfirmationDTO authConfirmation = new()
        {
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt
        };

        User user = new()
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Username = "test-user",
            MasterPasswordSalt = [9, 10, 11, 12],
            EncryptedMasterKeyWithRecovery = [13, 14, 15],
            RecoveryIV = [16, 17, 18]
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
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(user);

        _mockCryptoService
            .Setup(x => x.CreateToken(user.Id.ToString()))
            .Returns("mock-token");


        AuthResponseDTO? result = await _authService.SignInAsync(signInDto, _mockHttpResponse.Object);


        Assert.IsNotNull(result);
        Assert.AreEqual(user.Id, result?.User?.Id);
        Assert.AreEqual(user.Email, result?.User?.Email);
        Assert.AreEqual(user.Username, result?.User?.Username);
        _mockCookies.Verify(x => x.Append("AuthToken", "mock-token", It.IsAny<CookieOptions>()), Times.Once);
    }

    [TestMethod]
    public async Task SignInAsync_WithInvalidPassword_ThrowsUnauthorizedException()
    {

        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = "wrong-password"
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


        UnauthorizedException? exception = await Assert.ThrowsExceptionAsync<UnauthorizedException>(
            () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));

        CollectionAssert.Contains(exception?.Errors?.Keys, "Password");
        Assert.AreEqual("Invalid email or password", exception.Errors["Password"]);

        CollectionAssert.Contains(exception?.Errors?.Keys, "Email");
        Assert.AreEqual("Invalid email or password", exception.Errors["Email"]);

    }

    [TestMethod]
    public async Task SignInAsync_WithNonExistentEmail_ThrowsUnauthorizedException()
    {

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


        UnauthorizedException? exception = await Assert.ThrowsExceptionAsync<UnauthorizedException>(
            () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));

        CollectionAssert.Contains(exception?.Errors?.Keys, "Password");
        Assert.AreEqual("Invalid email or password", exception.Errors["Password"]);

        CollectionAssert.Contains(exception?.Errors?.Keys, "Email");
        Assert.AreEqual("Invalid email or password", exception.Errors["Email"]);
    }

    [TestMethod]
    public async Task SignInAsync_WithEmptyPassword_ThrowsUnauthorizedException()
    {

        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = ""
        };

        UnauthorizedException? exception = await Assert.ThrowsExceptionAsync<UnauthorizedException>(
                  () => _authService.SignInAsync(signInDto, _mockHttpResponse.Object));

        Assert.AreEqual("Invalid email or password", exception.Message);


    }

    #endregion

    #region SignUpAsync Tests

    [TestMethod]
    public async Task SignUpAsync_WithValidData_CreatesUserAndReturnsAuthResponse()
    {

        var signUpDto = new AuthSignUpDTO
        {
            Email = "newuser@example.com",
            Username = "new-user",
            Password = "password123",
            MasterPasswordSalt = [1, 2, 3],
            EncryptedMasterKeyWithRecovery = [4, 5, 6],
            RecoveryIV = [7, 8, 9]
        };

        var passwordSalt = new byte[] { 10, 11, 12 };
        var passwordHash = new byte[] { 13, 14, 15 };

        var createdUser = new User
        {
            Id = Guid.NewGuid(),
            Email = signUpDto.Email,
            Username = signUpDto.Username,
            MasterPasswordSalt = signUpDto.MasterPasswordSalt,
            EncryptedMasterKeyWithRecovery = signUpDto.EncryptedMasterKeyWithRecovery,
            RecoveryIV = signUpDto.RecoveryIV
        };

        _mockDataContext
            .Setup(x => x.LoadData<string>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string>());

        _mockCryptoService
            .Setup(x => x.GenerateSalt())
            .Returns(passwordSalt);

        _mockCryptoService
            .Setup(x => x.GetPasswordHash(signUpDto.Password, passwordSalt))
            .Returns(passwordHash);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(createdUser);

        _mockCryptoService
            .Setup(x => x.CreateToken(createdUser.Id.ToString()))
            .Returns("mock-token");


        var result = await _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object);


        Assert.IsNotNull(result);
        Assert.AreEqual(createdUser.Id, result?.User?.Id);
        Assert.AreEqual(createdUser.Email, result?.User?.Email);
        Assert.AreEqual(createdUser.Username, result?.User?.Username);
        _mockCookies.Verify(x => x.Append("AuthToken", "mock-token", It.IsAny<CookieOptions>()), Times.Once);
    }

    [TestMethod]
    public async Task SignUpAsync_WithExistingEmail_ThrowsUserAlreadyExistsException()
    {

        var signUpDto = new AuthSignUpDTO
        {
            Email = "existing@example.com",
            Username = "user",
            Password = "password123",
            MasterPasswordSalt = [1, 2, 3],
            EncryptedMasterKeyWithRecovery = [4, 5, 6],
            RecoveryIV = [7, 8, 9]
        };

        _mockDataContext
            .Setup(x => x.LoadData<string>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string> { "existing@example.com" });


        await Assert.ThrowsExceptionAsync<UserAlreadyExistsException>(
            () => _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object));
    }

    [TestMethod]
    public async Task SignUpAsync_WhenUserCreationFails_ThrowsUserCreationFailedException()
    {

        var signUpDto = new AuthSignUpDTO
        {
            Email = "newuser@example.com",
            Username = "newuser",
            Password = "password123",
            MasterPasswordSalt = [1, 2, 3],
            EncryptedMasterKeyWithRecovery = [4, 5, 6],
            RecoveryIV = [7, 8, 9]
        };

        _mockDataContext
            .Setup(x => x.LoadData<string>(It.IsAny<string>(), It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<string>());

        _mockCryptoService.Setup(x => x.GenerateSalt()).Returns([1, 2, 3]);
        _mockCryptoService.Setup(x => x.GetPasswordHash(It.IsAny<string>(), It.IsAny<byte[]>()))
            .Returns([4, 5, 6]);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(It.IsAny<string>(), It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((User?)null);


        await Assert.ThrowsExceptionAsync<UserCreationFailedException>(
            () => _authService.SignUpAsync(signUpDto, _mockHttpResponse.Object));
    }

    #endregion

    #region CheckSessionAsync Tests

    [TestMethod]
    public async Task CheckSessionAsync_WithValidUserGuid_ReturnsAuthResponse()
    {

        var userGuid = Guid.NewGuid();
        var user = new User
        {
            Id = userGuid,
            Email = "test@example.com",
            Username = "testuser",
            MasterPasswordSalt = [1, 2, 3],
            EncryptedMasterKeyWithRecovery = [4, 5, 6],
            RecoveryIV = [7, 8, 9]
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(user);


        var result = await _authService.CheckSessionAsync(userGuid);


        Assert.IsNotNull(result);
        Assert.AreEqual(user.Id, result?.User?.Id);
        Assert.AreEqual(user.Email, result?.User?.Email);
        Assert.AreEqual(user.Username, result?.User?.Username);
    }

    [TestMethod]
    public async Task CheckSessionAsync_WithInvalidUserGuid_ThrowsNotFoundException()
    {

        var userGuid = Guid.NewGuid();

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((User?)null);


        await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _authService.CheckSessionAsync(userGuid));
    }

    #endregion

    #region RefreshTokenAsync Tests

    [TestMethod]
    public async Task RefreshTokenAsync_WithValidUserGuid_ReturnsAuthResponseAndSetsCookie()
    {

        var userGuid = Guid.NewGuid();
        var user = new User
        {
            Id = userGuid,
            Email = "test@example.com",
            Username = "test-user",
            MasterPasswordSalt = [1, 2, 3],
            EncryptedMasterKeyWithRecovery = [4, 5, 6],
            RecoveryIV = [7, 8, 9]
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(user);

        _mockCryptoService
            .Setup(x => x.CreateToken(user.Id.ToString()))
            .Returns("refreshed-token");


        var result = await _authService.RefreshTokenAsync(userGuid, _mockHttpResponse.Object);


        Assert.IsNotNull(result);
        Assert.AreEqual(user.Id, result?.User?.Id);
        Assert.AreEqual(user.Email, result?.User?.Email);
        _mockCookies.Verify(x => x.Append("AuthToken", "refreshed-token", It.IsAny<CookieOptions>()), Times.Once);
    }

    [TestMethod]
    public async Task RefreshTokenAsync_WithInvalidUserGuid_ThrowsNotFoundException()
    {

        var userGuid = Guid.NewGuid();

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((User?)null);


        await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _authService.RefreshTokenAsync(userGuid, _mockHttpResponse.Object));
    }

    #endregion
}