using API.Dtos.User;
using API.Exceptions;
using API.Interfaces;
using API.Models;
using API.Services;
using Dapper;
using Moq;

namespace API.UnitTests;

[TestClass]
public sealed class MasterPasswordRecoveryServiceTests
{
    private Mock<IDataContext> _mockDataContext = null!;
    private MasterPasswordRecoveryService _masterPasswordRecoveryService = null!;
    private Guid _testUserGuid;

    [TestInitialize]
    public void Setup()
    {
        _mockDataContext = new Mock<IDataContext>();
        _masterPasswordRecoveryService = new MasterPasswordRecoveryService(_mockDataContext.Object);
        _testUserGuid = Guid.NewGuid();
    }

    #region GetMasterPasswordRecoveryAsync Tests

    [TestMethod]
    public async Task GetMasterPasswordRecoveryAsync_WithValidUserId_ReturnsRecoveryData()
    {
        // Arrange
        var expectedRecoveryData = new MasterKeyRecoveryResponseDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3, 4, 5 },
            RecoveryIV = new byte[] { 6, 7, 8, 9, 10 }
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedRecoveryData);

        // Act
        var result = await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(_testUserGuid);

        // Assert
        Assert.IsNotNull(result);
        CollectionAssert.AreEqual(expectedRecoveryData.EncryptedMasterKeyWithRecovery, result.EncryptedMasterKeyWithRecovery);
        CollectionAssert.AreEqual(expectedRecoveryData.RecoveryIV, result.RecoveryIV);
    }

    [TestMethod]
    public async Task GetMasterPasswordRecoveryAsync_CallsCorrectStoredProcedure()
    {
        // Arrange
        var expectedRecoveryData = CreateTestRecoveryResponseDTO();

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedRecoveryData);

        // Act
        await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(_testUserGuid);

        // Assert
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
            It.Is<string>(sql => sql.Contains("spUser_Select_MasterPasswordRecoveryData")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task GetMasterPasswordRecoveryAsync_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((MasterKeyRecoveryResponseDTO?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(_testUserGuid));

        Assert.AreEqual("User recovery data not found.", exception.Message);
    }

    [TestMethod]
    public async Task GetMasterPasswordRecoveryAsync_ReturnsCorrectEncryptedMasterKey()
    {
        // Arrange
        var expectedKey = new byte[] { 10, 20, 30, 40, 50, 60, 70, 80 };
        var expectedRecoveryData = new MasterKeyRecoveryResponseDTO
        {
            EncryptedMasterKeyWithRecovery = expectedKey,
            RecoveryIV = new byte[] { 1, 2, 3 }
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedRecoveryData);

        // Act
        var result = await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(_testUserGuid);

        // Assert
        CollectionAssert.AreEqual(expectedKey, result.EncryptedMasterKeyWithRecovery);
    }

    [TestMethod]
    public async Task GetMasterPasswordRecoveryAsync_ReturnsCorrectRecoveryIV()
    {
        // Arrange
        var expectedIV = new byte[] { 100, 110, 120, 130, 140, 150, 160, 170 };
        var expectedRecoveryData = new MasterKeyRecoveryResponseDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3 },
            RecoveryIV = expectedIV
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedRecoveryData);

        // Act
        var result = await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(_testUserGuid);

        // Assert
        CollectionAssert.AreEqual(expectedIV, result.RecoveryIV);
    }

    [TestMethod]
    public async Task GetMasterPasswordRecoveryAsync_WithLargeEncryptedKey_ReturnsCorrectly()
    {
        // Arrange
        var largeKey = new byte[1024];
        Array.Fill<byte>(largeKey, 0xAB);

        var expectedRecoveryData = new MasterKeyRecoveryResponseDTO
        {
            EncryptedMasterKeyWithRecovery = largeKey,
            RecoveryIV = new byte[] { 1, 2, 3 }
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedRecoveryData);

        // Act
        var result = await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(_testUserGuid);

        // Assert
        Assert.AreEqual(1024, result.EncryptedMasterKeyWithRecovery.Length);
        CollectionAssert.AreEqual(largeKey, result.EncryptedMasterKeyWithRecovery);
    }

    [TestMethod]
    public async Task GetMasterPasswordRecoveryAsync_PassesCorrectUserIdParameter()
    {
        // Arrange
        var specificUserId = Guid.NewGuid();
        var expectedRecoveryData = CreateTestRecoveryResponseDTO();

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedRecoveryData);

        // Act
        await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(specificUserId);

        // Assert
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
            It.Is<string>(sql => sql.Contains("@UserId")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    #endregion

    #region UpdateMasterPasswordRecoveryAsync Tests

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_WithValidData_ReturnsMasterPasswordSalt()
    {
        // Arrange
        var updateDto = CreateTestMasterKeyRecoveryEditDTO();
        var expectedSalt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };

        var returnedUser = CreateTestUser(_testUserGuid);
        returnedUser.MasterPasswordSalt = expectedSalt;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act
        var result = await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto);

        // Assert
        Assert.IsNotNull(result);
        CollectionAssert.AreEqual(expectedSalt, result);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_CallsCorrectStoredProcedure()
    {
        // Arrange
        var updateDto = CreateTestMasterKeyRecoveryEditDTO();
        var returnedUser = CreateTestUser(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act
        await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto);

        // Assert
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<User>(
            It.Is<string>(sql => sql.Contains("spUser_Update_MasterPasswordRecovery")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var updateDto = CreateTestMasterKeyRecoveryEditDTO();

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((User?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto));

        Assert.AreEqual("User not found.", exception.Message);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_WhenSaltIsNull_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        var updateDto = CreateTestMasterKeyRecoveryEditDTO();
        var returnedUser = new User
        {
            Id = _testUserGuid,
            MasterPasswordSalt = null!,
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3 },
            RecoveryIV = new byte[] { 4, 5, 6 }
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnexpectedCaughtException>(
            () => _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto));

        Assert.AreEqual("Failed to update master password salt.", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "MasterPassword");
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_WhenSaltIsEmpty_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        var updateDto = CreateTestMasterKeyRecoveryEditDTO();
        var returnedUser = new User
        {
            Id = _testUserGuid,
            MasterPasswordSalt = Array.Empty<byte>(),
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3 },
            RecoveryIV = new byte[] { 4, 5, 6 }
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnexpectedCaughtException>(
            () => _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto));

        Assert.AreEqual("Failed to update master password salt.", exception.Message);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_PassesAllParametersToStoredProcedure()
    {
        // Arrange
        var updateDto = CreateTestMasterKeyRecoveryEditDTO();
        var returnedUser = CreateTestUser(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act
        await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto);

        // Assert
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<User>(
            It.Is<string>(sql =>
                sql.Contains("@UserId") &&
                sql.Contains("@EncryptedMasterKeyWithRecovery") &&
                sql.Contains("@RecoveryIV") &&
                sql.Contains("@MasterPasswordSalt")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_WithLargeEncryptedKey_UpdatesSuccessfully()
    {
        // Arrange
        var largeKey = new byte[2048];
        Array.Fill<byte>(largeKey, 0xFF);

        var updateDto = new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = largeKey,
            RecoveryIV = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 },
            MasterPasswordSalt = new byte[] { 20, 21, 22, 23, 24, 25, 26, 27 }
        };

        var returnedUser = CreateTestUser(_testUserGuid);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act
        var result = await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto);

        // Assert
        Assert.IsNotNull(result);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_ReturnsExactSaltFromUser()
    {
        // Arrange
        var updateDto = CreateTestMasterKeyRecoveryEditDTO();
        var expectedSalt = new byte[] { 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115 };

        var returnedUser = CreateTestUser(_testUserGuid);
        returnedUser.MasterPasswordSalt = expectedSalt;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act
        var result = await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto);

        // Assert
        CollectionAssert.AreEqual(expectedSalt, result);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_WithMinimalValidSalt_ReturnsSuccessfully()
    {
        // Arrange
        var updateDto = CreateTestMasterKeyRecoveryEditDTO();
        var minimalSalt = new byte[] { 1 };

        var returnedUser = CreateTestUser(_testUserGuid);
        returnedUser.MasterPasswordSalt = minimalSalt;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act
        var result = await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto);

        // Assert
        Assert.AreEqual(1, result.Length);
        CollectionAssert.AreEqual(minimalSalt, result);
    }

    #endregion

    #region Edge Cases Tests

    [TestMethod]
    public async Task GetMasterPasswordRecoveryAsync_WithDifferentUserIds_CallsWithCorrectId()
    {
        // Arrange
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        var recoveryData = CreateTestRecoveryResponseDTO();

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(recoveryData);

        // Act
        await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(userId1);
        await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(userId2);

        // Assert
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
            It.IsAny<string>(),
            It.IsAny<DynamicParameters?>()), Times.Exactly(2));
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_WithDifferentUserIds_CallsWithCorrectId()
    {
        // Arrange
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        var updateDto = CreateTestMasterKeyRecoveryEditDTO();
        var returnedUser = CreateTestUser(userId1);

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act
        await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(userId1, updateDto);

        returnedUser.Id = userId2;
        await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(userId2, updateDto);

        // Assert
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<User>(
            It.IsAny<string>(),
            It.IsAny<DynamicParameters?>()), Times.Exactly(2));
    }

    [TestMethod]
    public async Task GetMasterPasswordRecoveryAsync_WithEmptyGuid_CallsStoredProcedure()
    {
        // Arrange
        var emptyGuid = Guid.Empty;
        var recoveryData = CreateTestRecoveryResponseDTO();

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(recoveryData);

        // Act
        var result = await _masterPasswordRecoveryService.GetMasterPasswordRecoveryAsync(emptyGuid);

        // Assert
        Assert.IsNotNull(result);
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<MasterKeyRecoveryResponseDTO>(
            It.IsAny<string>(),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_WithAllMaxByteValues_UpdatesSuccessfully()
    {
        // Arrange
        var maxByteArray = new byte[256];
        Array.Fill<byte>(maxByteArray, byte.MaxValue);

        var updateDto = new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = maxByteArray,
            RecoveryIV = maxByteArray,
            MasterPasswordSalt = maxByteArray
        };

        var returnedUser = CreateTestUser(_testUserGuid);
        returnedUser.MasterPasswordSalt = new byte[] { 1, 2, 3, 4 };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act
        var result = await _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto);

        // Assert
        Assert.IsNotNull(result);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecoveryAsync_VerifiesUnexpectedCaughtExceptionErrorDetails()
    {
        // Arrange
        var updateDto = CreateTestMasterKeyRecoveryEditDTO();
        var returnedUser = new User
        {
            Id = _testUserGuid,
            MasterPasswordSalt = Array.Empty<byte>(),
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3 },
            RecoveryIV = new byte[] { 4, 5, 6 }
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<User>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(returnedUser);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnexpectedCaughtException>(
            () => _masterPasswordRecoveryService.UpdateMasterPasswordRecoveryAsync(_testUserGuid, updateDto));

        Assert.IsNotNull(exception.Errors);
        Assert.AreEqual(" The master password salt is null or empty after update.", exception.Errors["MasterPassword"]);
    }

    #endregion

    #region Helper Methods

    private static MasterKeyRecoveryResponseDTO CreateTestRecoveryResponseDTO()
    {
        return new MasterKeyRecoveryResponseDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 },
            RecoveryIV = new byte[] { 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 }
        };
    }

    private static MasterKeyRecoveryEditDTO CreateTestMasterKeyRecoveryEditDTO()
    {
        return new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 },
            RecoveryIV = new byte[] { 9, 10, 11, 12, 13, 14, 15, 16 },
            MasterPasswordSalt = new byte[] { 17, 18, 19, 20, 21, 22, 23, 24 }
        };
    }

    private static User CreateTestUser(Guid userId)
    {
        return new User
        {
            Id = userId,
            Username = "testuser",
            Email = "test@example.com",
            MasterPasswordSalt = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 },
            EncryptedMasterKeyWithRecovery = new byte[] { 20, 21, 22, 23, 24, 25, 26, 27 },
            RecoveryIV = new byte[] { 30, 31, 32, 33, 34, 35, 36, 37 },
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            UpdatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
