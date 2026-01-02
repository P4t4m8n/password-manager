using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using API.Exceptions;
using API.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Moq;

namespace API.UnitTests;

[TestClass]
public sealed class CryptoServiceTests
{
    private Mock<IConfiguration> _mockConfiguration = null!;
    private CryptoService _cryptoService = null!;

    // Must be at least 64 bytes for HmacSha512
    private const string ValidTokenKey = "ThisIsAVeryLongTokenKeyThatMustBeAtLeast64BytesLongForHmacSha512AlgorithmToWork!!!";
    private const string ValidPasswordKey = "TestPasswordKey123!@#";

    [TestInitialize]
    public void Setup()
    {
        _mockConfiguration = new Mock<IConfiguration>();
        SetupValidConfiguration();
        _cryptoService = new CryptoService(_mockConfiguration.Object);
    }

    private void SetupValidConfiguration()
    {
        _mockConfiguration.Setup(x => x["Crypto:PasswordKey"]).Returns(ValidPasswordKey);
        _mockConfiguration.Setup(x => x["Crypto:TokenKey"]).Returns(ValidTokenKey);
    }

    #region GetPasswordHash Tests

    [TestMethod]
    public void GetPasswordHash_WithValidInput_ReturnsHash()
    {
        // Arrange
        string password = "TestPassword123";
        byte[] salt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };

        // Act
        byte[] result = _cryptoService.GetPasswordHash(password, salt);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(32, result.Length); // 256 bits = 32 bytes
    }

    [TestMethod]
    public void GetPasswordHash_WithSameInputs_ReturnsSameHash()
    {
        // Arrange
        string password = "TestPassword123";
        byte[] salt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };

        // Act
        byte[] result1 = _cryptoService.GetPasswordHash(password, salt);
        byte[] result2 = _cryptoService.GetPasswordHash(password, salt);

        // Assert
        CollectionAssert.AreEqual(result1, result2);
    }

    [TestMethod]
    public void GetPasswordHash_WithDifferentPasswords_ReturnsDifferentHashes()
    {
        // Arrange
        byte[] salt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };

        // Act
        byte[] result1 = _cryptoService.GetPasswordHash("Password1", salt);
        byte[] result2 = _cryptoService.GetPasswordHash("Password2", salt);

        // Assert
        CollectionAssert.AreNotEqual(result1, result2);
    }

    [TestMethod]
    public void GetPasswordHash_WithDifferentSalts_ReturnsDifferentHashes()
    {
        // Arrange
        string password = "TestPassword123";
        byte[] salt1 = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };
        byte[] salt2 = new byte[] { 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 };

        // Act
        byte[] result1 = _cryptoService.GetPasswordHash(password, salt1);
        byte[] result2 = _cryptoService.GetPasswordHash(password, salt2);

        // Assert
        CollectionAssert.AreNotEqual(result1, result2);
    }

    [TestMethod]
    public void GetPasswordHash_WhenPasswordKeyNotConfigured_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        _mockConfiguration.Setup(x => x["Crypto:PasswordKey"]).Returns((string?)null);
        var service = new CryptoService(_mockConfiguration.Object);
        byte[] salt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 };

        // Act & Assert
        var exception = Assert.ThrowsException<UnexpectedCaughtException>(
            () => service.GetPasswordHash("password", salt));

        Assert.AreEqual("Password key is not configured.", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "ConfigKey");
        Assert.AreEqual("Crypto:PasswordKey", exception.Errors["ConfigKey"]);
    }

    [TestMethod]
    public void GetPasswordHash_WhenPasswordKeyIsEmpty_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        _mockConfiguration.Setup(x => x["Crypto:PasswordKey"]).Returns(string.Empty);
        var service = new CryptoService(_mockConfiguration.Object);
        byte[] salt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 };

        // Act & Assert
        var exception = Assert.ThrowsException<UnexpectedCaughtException>(
            () => service.GetPasswordHash("password", salt));

        Assert.AreEqual("Password key is not configured.", exception.Message);
    }

    [TestMethod]
    public void GetPasswordHash_WithEmptyPassword_ReturnsHash()
    {
        // Arrange
        string password = "";
        byte[] salt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };

        // Act
        byte[] result = _cryptoService.GetPasswordHash(password, salt);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(32, result.Length);
    }

    [TestMethod]
    public void GetPasswordHash_WithSpecialCharacters_ReturnsHash()
    {
        // Arrange
        string password = "P@$$w0rd!#%^&*()_+{}[]|\\:\";<>?,./~`'日本語";
        byte[] salt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };

        // Act
        byte[] result = _cryptoService.GetPasswordHash(password, salt);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(32, result.Length);
    }

    [TestMethod]
    public void GetPasswordHash_WithLongPassword_ReturnsHash()
    {
        // Arrange
        string password = new string('a', 10000);
        byte[] salt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };

        // Act
        byte[] result = _cryptoService.GetPasswordHash(password, salt);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(32, result.Length);
    }

    [TestMethod]
    public void GetPasswordHash_WithMinimalSalt_ReturnsHash()
    {
        // Arrange
        string password = "TestPassword";
        byte[] salt = new byte[] { 1 };

        // Act
        byte[] result = _cryptoService.GetPasswordHash(password, salt);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(32, result.Length);
    }

    #endregion

    #region CreateToken Tests

    [TestMethod]
    public void CreateToken_WithValidUserId_ReturnsToken()
    {
        // Arrange
        string userId = Guid.NewGuid().ToString();

        // Act
        string result = _cryptoService.CreateToken(userId);

        // Assert
        Assert.IsNotNull(result);
        Assert.IsFalse(string.IsNullOrEmpty(result));
    }

    [TestMethod]
    public void CreateToken_ReturnsValidJwtFormat()
    {
        // Arrange
        string userId = Guid.NewGuid().ToString();

        // Act
        string result = _cryptoService.CreateToken(userId);

        // Assert
        string[] parts = result.Split('.');
        Assert.AreEqual(3, parts.Length); // JWT has 3 parts: header.payload.signature
    }

    [TestMethod]
    public void CreateToken_ContainsUserIdClaim()
    {
        // Arrange
        string userId = Guid.NewGuid().ToString();

        // Act
        string token = _cryptoService.CreateToken(userId);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "userId");

        Assert.IsNotNull(userIdClaim);
        Assert.AreEqual(userId, userIdClaim.Value);
    }

    [TestMethod]
    public void CreateToken_HasExpirationDate()
    {
        // Arrange
        string userId = Guid.NewGuid().ToString();

        // Act
        string token = _cryptoService.CreateToken(userId);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.IsTrue(jwtToken.ValidTo > DateTime.UtcNow);
    }

    [TestMethod]
    public void CreateToken_ExpiresInAboutOneDay()
    {
        // Arrange
        string userId = Guid.NewGuid().ToString();
        var beforeCreation = DateTime.UtcNow;

        // Act
        string token = _cryptoService.CreateToken(userId);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Token should expire approximately 1 day from now (with some tolerance for test execution time)
        var expectedExpiration = beforeCreation.AddDays(1);
        var timeDifference = Math.Abs((jwtToken.ValidTo - expectedExpiration).TotalMinutes);

        Assert.IsTrue(timeDifference < 5, $"Token expiration differs by {timeDifference} minutes from expected");
    }

    [TestMethod]
    public void CreateToken_WhenTokenKeyNotConfigured_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        _mockConfiguration.Setup(x => x["Crypto:TokenKey"]).Returns((string?)null);
        var service = new CryptoService(_mockConfiguration.Object);

        // Act & Assert
        var exception = Assert.ThrowsException<UnexpectedCaughtException>(
            () => service.CreateToken("user-id"));

        Assert.AreEqual("Token key is not configured.", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "ConfigKey");
        Assert.AreEqual("Crypto:TokenKey", exception.Errors["ConfigKey"]);
    }

    [TestMethod]
    public void CreateToken_WhenTokenKeyIsEmpty_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        _mockConfiguration.Setup(x => x["Crypto:TokenKey"]).Returns(string.Empty);
        var service = new CryptoService(_mockConfiguration.Object);

        // Act & Assert
        var exception = Assert.ThrowsException<UnexpectedCaughtException>(
            () => service.CreateToken("user-id"));

        Assert.AreEqual("Token key is not configured.", exception.Message);
    }

    [TestMethod]
    public void CreateToken_WithDifferentUserIds_ReturnsDifferentTokens()
    {
        // Arrange
        string userId1 = Guid.NewGuid().ToString();
        string userId2 = Guid.NewGuid().ToString();

        // Act
        string token1 = _cryptoService.CreateToken(userId1);
        string token2 = _cryptoService.CreateToken(userId2);

        // Assert
        Assert.AreNotEqual(token1, token2);
    }

    [TestMethod]
    public void CreateToken_WithEmptyUserId_ReturnsToken()
    {
        // Arrange
        string userId = "";

        // Act
        string result = _cryptoService.CreateToken(userId);

        // Assert
        Assert.IsNotNull(result);
        Assert.IsFalse(string.IsNullOrEmpty(result));
    }

    [TestMethod]
    public void CreateToken_UsesHmacSha512Signature()
    {
        // Arrange
        string userId = Guid.NewGuid().ToString();

        // Act
        string token = _cryptoService.CreateToken(userId);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.AreEqual("HS512", jwtToken.Header.Alg);
    }

    [TestMethod]
    public void CreateToken_CanBeValidatedWithSameKey()
    {
        // Arrange
        string userId = Guid.NewGuid().ToString();
        string token = _cryptoService.CreateToken(userId);

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(ValidTokenKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };

        // Act & Assert
        var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

        Assert.IsNotNull(principal);
        Assert.IsNotNull(validatedToken);
    }

    #endregion

    #region GenerateSalt Tests

    [TestMethod]
    public void GenerateSalt_ReturnsNonNullSalt()
    {
        // Act
        byte[] result = _cryptoService.GenerateSalt();

        // Assert
        Assert.IsNotNull(result);
    }

    [TestMethod]
    public void GenerateSalt_Returns16ByteSalt()
    {
        // Act
        byte[] result = _cryptoService.GenerateSalt();

        // Assert
        Assert.AreEqual(16, result.Length); // 128 bits = 16 bytes
    }

    [TestMethod]
    public void GenerateSalt_ReturnsNonZeroBytes()
    {
        // Act
        byte[] result = _cryptoService.GenerateSalt();

        // Assert
        // GetNonZeroBytes ensures no zero bytes
        Assert.IsFalse(result.Any(b => b == 0));
    }

    [TestMethod]
    public void GenerateSalt_ReturnsDifferentSaltsOnMultipleCalls()
    {
        // Act
        byte[] salt1 = _cryptoService.GenerateSalt();
        byte[] salt2 = _cryptoService.GenerateSalt();
        byte[] salt3 = _cryptoService.GenerateSalt();

        // Assert
        CollectionAssert.AreNotEqual(salt1, salt2);
        CollectionAssert.AreNotEqual(salt2, salt3);
        CollectionAssert.AreNotEqual(salt1, salt3);
    }

    [TestMethod]
    public void GenerateSalt_ProducesRandomOutput()
    {
        // Arrange
        const int sampleSize = 100;
        var salts = new List<byte[]>();

        // Act
        for (int i = 0; i < sampleSize; i++)
        {
            salts.Add(_cryptoService.GenerateSalt());
        }

        // Assert - All salts should be unique
        var uniqueSalts = salts.Select(s => Convert.ToBase64String(s)).Distinct().Count();
        Assert.AreEqual(sampleSize, uniqueSalts, "All generated salts should be unique");
    }

    [TestMethod]
    public void GenerateSalt_CanBeUsedWithGetPasswordHash()
    {
        // Arrange
        string password = "TestPassword123";

        // Act
        byte[] salt = _cryptoService.GenerateSalt();
        byte[] hash = _cryptoService.GetPasswordHash(password, salt);

        // Assert
        Assert.IsNotNull(hash);
        Assert.AreEqual(32, hash.Length);
    }

    #endregion

    #region Integration Tests

    [TestMethod]
    public void PasswordHashAndSalt_WorkTogetherForVerification()
    {
        // Arrange
        string password = "MySecurePassword123!";
        byte[] salt = _cryptoService.GenerateSalt();

        // Act
        byte[] hash1 = _cryptoService.GetPasswordHash(password, salt);
        byte[] hash2 = _cryptoService.GetPasswordHash(password, salt);

        // Assert - Same password + same salt = same hash (for verification)
        CollectionAssert.AreEqual(hash1, hash2);
    }

    [TestMethod]
    public void DifferentPasswordsSameSalt_ProduceDifferentHashes()
    {
        // Arrange
        byte[] salt = _cryptoService.GenerateSalt();

        // Act
        byte[] hash1 = _cryptoService.GetPasswordHash("Password1", salt);
        byte[] hash2 = _cryptoService.GetPasswordHash("Password2", salt);

        // Assert
        CollectionAssert.AreNotEqual(hash1, hash2);
    }

    [TestMethod]
    public void SamePasswordDifferentSalts_ProduceDifferentHashes()
    {
        // Arrange
        string password = "SamePassword";
        byte[] salt1 = _cryptoService.GenerateSalt();
        byte[] salt2 = _cryptoService.GenerateSalt();

        // Act
        byte[] hash1 = _cryptoService.GetPasswordHash(password, salt1);
        byte[] hash2 = _cryptoService.GetPasswordHash(password, salt2);

        // Assert
        CollectionAssert.AreNotEqual(hash1, hash2);
    }

    [TestMethod]
    public void CreateToken_AndExtractUserId_WorksTogether()
    {
        // Arrange
        var originalUserId = Guid.NewGuid().ToString();

        // Act
        string token = _cryptoService.CreateToken(originalUserId);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var extractedUserId = jwtToken.Claims.First(c => c.Type == "userId").Value;

        // Assert
        Assert.AreEqual(originalUserId, extractedUserId);
    }

    #endregion
}
