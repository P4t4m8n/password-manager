using System.Net;
using System.Net.Http.Json;
using API.Dtos.Auth;
using API.Dtos.Http;
using API.Dtos.User;
using API.Enums;
using API.IntegrationTests.Infrastructure;
using API.Models;
using Moq;

namespace API.IntegrationTests.Controllers;

[TestClass]
public class AuthControllerTests : IntegrationTestBase
{
    #region Sign-In Tests

    [TestMethod]
    public async Task SignIn_WithValidCredentials_Returns200AndAuthResponse()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var expectedResponse = CreateTestAuthResponse();

        Factory.MockAuthService
            .Setup(x => x.SignInAsync(
                It.Is<AuthSignInDTO>(dto => dto.Email == signInDto.Email),
                It.IsAny<Microsoft.AspNetCore.Http.HttpResponse>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var response = await Client.PostAsJsonAsync("/api/Auth/Sign-in", signInDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<AuthResponseDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("Sign-in successful", result.Message);
        Assert.IsNotNull(result.Data?.User);
    }

    [TestMethod]
    public async Task SignIn_WithInvalidCredentials_Returns401()
    {
        // Arrange
        var signInDto = new AuthSignInDTO
        {
            Email = "test@example.com",
            Password = "wrongpassword"
        };

        Factory.MockAuthService
            .Setup(x => x.SignInAsync(
                It.IsAny<AuthSignInDTO>(),
                It.IsAny<Microsoft.AspNetCore.Http.HttpResponse>()))
            .ThrowsAsync(new API.Exceptions.UnauthorizedException("Invalid email or password"));

        // Act
        var response = await Client.PostAsJsonAsync("/api/Auth/Sign-in", signInDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task SignIn_WithMissingEmail_Returns400()
    {
        // Arrange
        var signInDto = new { Password = "password123" }; // Missing email

        // Act
        var response = await Client.PostAsJsonAsync("/api/Auth/Sign-in", signInDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    #endregion

    #region Sign-Up Tests

    [TestMethod]
    public async Task SignUp_WithValidData_Returns201()
    {
        // Arrange
        var signUpDto = new AuthSignUpDTO
        {
            Email = "newuser@example.com",
            Password = "SecurePassword123!",
            ConfirmPassword = "SecurePassword123!",
            Username = "newuser",
            MasterPasswordSalt = new byte[] { 1, 2, 3, 4 },
            EncryptedMasterKeyWithRecovery = new byte[] { 5, 6, 7, 8 },
            RecoveryIV = new byte[] { 9, 10, 11, 12 }
        };

        var expectedResponse = CreateTestAuthResponse();

        Factory.MockAuthService
            .Setup(x => x.SignUpAsync(
                It.IsAny<AuthSignUpDTO>(),
                It.IsAny<Microsoft.AspNetCore.Http.HttpResponse>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var response = await Client.PostAsJsonAsync("/api/Auth/Sign-up", signUpDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<AuthResponseDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("User created successfully", result.Message);
    }

    [TestMethod]
    public async Task SignUp_WithExistingEmail_Returns409()
    {
        // Arrange
        var signUpDto = new AuthSignUpDTO
        {
            Email = "existing@example.com",
            Password = "SecurePassword123!",
            ConfirmPassword = "SecurePassword123!",
            Username = "existinguser",
            MasterPasswordSalt = new byte[] { 1, 2, 3, 4 },
            EncryptedMasterKeyWithRecovery = new byte[] { 5, 6, 7, 8 },
            RecoveryIV = new byte[] { 9, 10, 11, 12 }
        };

        Factory.MockAuthService
            .Setup(x => x.SignUpAsync(
                It.IsAny<AuthSignUpDTO>(),
                It.IsAny<Microsoft.AspNetCore.Http.HttpResponse>()))
            .ThrowsAsync(new API.Exceptions.UserAlreadyExistsException());

        // Act
        var response = await Client.PostAsJsonAsync("/api/Auth/Sign-up", signUpDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.Conflict, response.StatusCode);
    }

    #endregion

    #region Check-Session Tests

    [TestMethod]
    public async Task CheckSession_WhenAuthenticated_Returns200()
    {
        // Arrange
        AuthenticateClient();
        var expectedResponse = CreateTestAuthResponse();

        Factory.MockAuthService
            .Setup(x => x.CheckSessionAsync(It.IsAny<Guid>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var response = await Client.GetAsync("/api/Auth/Check-session");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<AuthResponseDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("User is authenticated", result.Message);
    }

    [TestMethod]
    public async Task CheckSession_WhenNotAuthenticated_Returns401()
    {
        // Arrange - No authentication

        // Act
        var response = await Client.GetAsync("/api/Auth/Check-session");

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    #endregion

    #region Refresh-Token Tests

    [TestMethod]
    public async Task RefreshToken_WhenAuthenticated_Returns200()
    {
        // Arrange
        AuthenticateClient();
        var expectedResponse = CreateTestAuthResponse();

        Factory.MockAuthService
            .Setup(x => x.RefreshTokenAsync(
                It.IsAny<Guid>(),
                It.IsAny<Microsoft.AspNetCore.Http.HttpResponse>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var response = await Client.GetAsync("/api/Auth/Refresh-token");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<AuthResponseDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("Token refreshed successfully", result.Message);
    }

    #endregion

    #region Sign-Out Tests

    [TestMethod]
    public async Task SignOut_WhenAuthenticated_Returns200()
    {
        // Arrange
        AuthenticateClient();

        // Act
        var response = await Client.PostAsync("/api/Auth/Sign-out", null);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
    }

    #endregion

    #region Helper Methods

    private static AuthResponseDTO CreateTestAuthResponse()
    {
        return new AuthResponseDTO
        {
            User = new UserDTO
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                Username = "testuser",
                Settings = new UserSettingsDTO
                {
                    UserId = Guid.NewGuid(),
                    MasterPasswordTTLInMinutes = 30,
                    AutoLockTimeInMinutes = 15,
                    Theme = ThemeEnum.system,
                    MinimumPasswordStrength = PasswordStrengthEnum.medium,
                    MasterPasswordStorageMode = StorageModeEnum.session
                }
            },
            MasterPasswordSalt = [1, 2, 3, 4, 5, 6, 7, 8]
        };
    }

    #endregion
}
