using API.Exceptions;
using API.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace API.UnitTests;

[TestClass]
public sealed class CryptoServiceTests
{
    private Mock<IConfiguration> _mockConfig = null!;
    private CryptoService _cryptoService = null!;

    [TestInitialize]
    public void Setup()
    {
        _mockConfig = new Mock<IConfiguration>();
        _cryptoService = new CryptoService(_mockConfig.Object);
    }

    [TestMethod]
    public void GenerateSalt_Returns16Bytes()
    {
        byte[] result = _cryptoService.GenerateSalt();
        Assert.AreEqual(16, result.Length);
    }

    [TestMethod]
    public void GetPasswordHash_ValidKey_Returns32Bytes()
    {
        _mockConfig.Setup(x => x["Crypto:PasswordKey"]).Returns("super-secret-key");
        byte[] salt = new byte[16];

        byte[] result = _cryptoService.GetPasswordHash("password", salt);

        Assert.AreEqual(32, result.Length);
    }

    [TestMethod]
    public void GetPasswordHash_EmptyPassword_ReturnsHash()
    {
        _mockConfig.Setup(x => x["Crypto:PasswordKey"]).Returns("super-secret-key");
        byte[] salt = new byte[16];

        byte[] result = _cryptoService.GetPasswordHash("", salt);

        Assert.AreEqual(32, result.Length);
    }

    [TestMethod]
    public void GetPasswordHash_MissingKey_ThrowsException()
    {
        _mockConfig.Setup(x => x["Crypto:PasswordKey"]).Returns((string?)null);
        byte[] salt = new byte[16];

        UnexpectedCaughtException exception = Assert.ThrowsException<UnexpectedCaughtException>(
            () => _cryptoService.GetPasswordHash("password", salt));

        Assert.AreEqual("Password key is not configured.", exception.Message);

        CollectionAssert.Contains(exception?.Errors?.Keys, "ConfigKey");

        Assert.AreEqual("Crypto:PasswordKey", exception.Errors["ConfigKey"]);
    }

    [TestMethod]
    public void CreateToken_MissingKey_ThrowsException()
    {
        _mockConfig.Setup(x => x["Crypto:TokenKey"]).Returns((string?)null);

        UnexpectedCaughtException exception = Assert.ThrowsException<UnexpectedCaughtException>(
            () => _cryptoService.CreateToken("user-id"));

        Assert.AreEqual("Token key is not configured.", exception.Message);
        CollectionAssert.Contains(exception?.Errors?.Keys, "ConfigKey");
        Assert.AreEqual("Crypto:TokenKey", exception.Errors["ConfigKey"]);
    }

    [TestMethod]
    public void CreateToken_ValidKey_ReturnsString()
    {
        string longKey = "super-long-secret-key-that-is-at-least-64-bytes-long-for-security-reasons-1234567890";
        _mockConfig.Setup(x => x["Crypto:TokenKey"]).Returns(longKey);

        string result = _cryptoService.CreateToken("user-id");

        Assert.IsFalse(string.IsNullOrEmpty(result));
    }


}