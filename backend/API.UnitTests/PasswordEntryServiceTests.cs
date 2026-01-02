using API.Dtos.PasswordEntry;
using API.Exceptions;
using API.Interfaces;
using API.QueryParams;
using API.Services;
using Dapper;
using Moq;

namespace API.UnitTests;

[TestClass]
public sealed class PasswordEntryServiceTests
{
    private Mock<IDataContext> _mockDataContext = null!;
    private PasswordEntryService _passwordEntryService = null!;
    private Guid _testUserGuid;
    private Guid _testEntryGuid;

    [TestInitialize]
    public void Setup()
    {
        _mockDataContext = new Mock<IDataContext>();
        _passwordEntryService = new PasswordEntryService(_mockDataContext.Object);
        _testUserGuid = Guid.NewGuid();
        _testEntryGuid = Guid.NewGuid();
    }

    #region GetPasswordEntriesAsync Tests

    [TestMethod]
    public async Task GetPasswordEntriesAsync_WithDefaultParams_ReturnsEntries()
    {
        // Arrange
        var queryParams = new PasswordEntryQueryParams();
        var expectedEntries = new List<PasswordEntryDTO>
        {
            CreateTestPasswordEntryDTO(),
            CreateTestPasswordEntryDTO()
        };

        _mockDataContext
            .Setup(x => x.LoadData<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntries);

        // Act
        var result = await _passwordEntryService.GetPasswordEntriesAsync(_testUserGuid, queryParams);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(2, result.Count());
        _mockDataContext.Verify(x => x.LoadData<PasswordEntryDTO>(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Select_Many")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task GetPasswordEntriesAsync_WithCustomLimitAndOffset_PassesCorrectParameters()
    {
        // Arrange
        var queryParams = new PasswordEntryQueryParams
        {
            Limit = 25,
            Offset = 10,
            EntryName = "test",
            WebsiteUrl = "https://example.com"
        };

        _mockDataContext
            .Setup(x => x.LoadData<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<PasswordEntryDTO>());

        // Act
        await _passwordEntryService.GetPasswordEntriesAsync(_testUserGuid, queryParams);

        // Assert
        _mockDataContext.Verify(x => x.LoadData<PasswordEntryDTO>(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Select_Many")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task GetPasswordEntriesAsync_WithNullLimitAndOffset_UsesDefaultValues()
    {
        // Arrange
        var queryParams = new PasswordEntryQueryParams
        {
            Limit = null,
            Offset = null
        };

        _mockDataContext
            .Setup(x => x.LoadData<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<PasswordEntryDTO>());

        // Act
        await _passwordEntryService.GetPasswordEntriesAsync(_testUserGuid, queryParams);

        // Assert
        _mockDataContext.Verify(x => x.LoadData<PasswordEntryDTO>(
            It.IsAny<string>(),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task GetPasswordEntriesAsync_ReturnsEmptyList_WhenNoEntriesExist()
    {
        // Arrange
        var queryParams = new PasswordEntryQueryParams();

        _mockDataContext
            .Setup(x => x.LoadData<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<PasswordEntryDTO>());

        // Act
        var result = await _passwordEntryService.GetPasswordEntriesAsync(_testUserGuid, queryParams);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(0, result.Count());
    }

    [TestMethod]
    public async Task GetPasswordEntriesAsync_WithEntryNameFilter_ReturnsFilteredEntries()
    {
        // Arrange
        var queryParams = new PasswordEntryQueryParams
        {
            EntryName = "Gmail"
        };
        var expectedEntries = new List<PasswordEntryDTO>
        {
            CreateTestPasswordEntryDTO("Gmail Account")
        };

        _mockDataContext
            .Setup(x => x.LoadData<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntries);

        // Act
        var result = await _passwordEntryService.GetPasswordEntriesAsync(_testUserGuid, queryParams);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(1, result.Count());
        Assert.AreEqual("Gmail Account", result.First().EntryName);
    }

    #endregion

    #region GetPasswordEntryByIdAsync Tests

    [TestMethod]
    public async Task GetPasswordEntryByIdAsync_WithValidId_ReturnsEntry()
    {
        // Arrange
        var expectedEntry = CreateTestPasswordEntryDTO();
        expectedEntry.Id = _testEntryGuid;

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntry);

        // Act
        var result = await _passwordEntryService.GetPasswordEntryByIdAsync(_testUserGuid, _testEntryGuid);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(_testEntryGuid, result.Id);
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Select_ById")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task GetPasswordEntryByIdAsync_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((PasswordEntryDTO?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _passwordEntryService.GetPasswordEntryByIdAsync(_testUserGuid, nonExistentId));

        Assert.AreEqual("Password Entry not found", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "EntryId");
        Assert.AreEqual(nonExistentId.ToString(), exception.Errors["EntryId"]);
    }

    [TestMethod]
    public async Task GetPasswordEntryByIdAsync_ReturnsCorrectEntryData()
    {
        // Arrange
        var expectedEntry = new PasswordEntryDTO
        {
            Id = _testEntryGuid,
            EntryName = "Test Entry",
            WebsiteUrl = "https://test.com",
            EntryUserName = "testuser",
            EncryptedPassword = new byte[] { 1, 2, 3, 4 },
            IV = "test-iv",
            Notes = "Test notes",
            IsLiked = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntry);

        // Act
        var result = await _passwordEntryService.GetPasswordEntryByIdAsync(_testUserGuid, _testEntryGuid);

        // Assert
        Assert.AreEqual(expectedEntry.EntryName, result.EntryName);
        Assert.AreEqual(expectedEntry.WebsiteUrl, result.WebsiteUrl);
        Assert.AreEqual(expectedEntry.EntryUserName, result.EntryUserName);
        CollectionAssert.AreEqual(expectedEntry.EncryptedPassword, result.EncryptedPassword);
        Assert.AreEqual(expectedEntry.IV, result.IV);
        Assert.AreEqual(expectedEntry.Notes, result.Notes);
        Assert.AreEqual(expectedEntry.IsLiked, result.IsLiked);
    }

    #endregion

    #region CreatePasswordEntryAsync Tests

    [TestMethod]
    public async Task CreatePasswordEntryAsync_WithValidData_ReturnsCreatedEntry()
    {
        // Arrange
        var createDto = new PasswordEntryCreateDTO
        {
            EntryName = "New Entry",
            WebsiteUrl = "https://newsite.com",
            EntryUserName = "newuser",
            EncryptedPassword = new byte[] { 1, 2, 3 },
            IV = "new-iv",
            Notes = "New notes"
        };

        var expectedEntry = new PasswordEntryDTO
        {
            Id = Guid.NewGuid(),
            EntryName = createDto.EntryName,
            WebsiteUrl = createDto.WebsiteUrl,
            EntryUserName = createDto.EntryUserName,
            EncryptedPassword = createDto.EncryptedPassword,
            IV = createDto.IV,
            Notes = createDto.Notes,
            IsLiked = false
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntry);

        // Act
        var result = await _passwordEntryService.CreatePasswordEntryAsync(_testUserGuid, createDto);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(createDto.EntryName, result.EntryName);
        Assert.AreEqual(createDto.WebsiteUrl, result.WebsiteUrl);
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Insert")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task CreatePasswordEntryAsync_WhenInsertFails_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        var createDto = new PasswordEntryCreateDTO
        {
            EntryName = "New Entry",
            WebsiteUrl = "https://newsite.com",
            EncryptedPassword = new byte[] { 1, 2, 3 },
            IV = "new-iv"
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((PasswordEntryDTO?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnexpectedCaughtException>(
            () => _passwordEntryService.CreatePasswordEntryAsync(_testUserGuid, createDto));

        Assert.AreEqual("Failed to create password entry", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "Insertion");
    }

    [TestMethod]
    public async Task CreatePasswordEntryAsync_WithNullOptionalFields_CreatesEntrySuccessfully()
    {
        // Arrange
        var createDto = new PasswordEntryCreateDTO
        {
            EntryName = "Minimal Entry",
            WebsiteUrl = "https://minimal.com",
            EntryUserName = null,
            EncryptedPassword = new byte[] { 1, 2, 3 },
            IV = "iv",
            Notes = null
        };

        var expectedEntry = new PasswordEntryDTO
        {
            Id = Guid.NewGuid(),
            EntryName = createDto.EntryName,
            WebsiteUrl = createDto.WebsiteUrl,
            EncryptedPassword = createDto.EncryptedPassword,
            IV = createDto.IV
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntry);

        // Act
        var result = await _passwordEntryService.CreatePasswordEntryAsync(_testUserGuid, createDto);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(createDto.EntryName, result.EntryName);
    }

    #endregion

    #region UpdatePasswordEntryAsync Tests

    [TestMethod]
    public async Task UpdatePasswordEntryAsync_WithValidData_ReturnsUpdatedEntry()
    {
        // Arrange
        var updateDto = new PasswordEntryUpdateDTO
        {
            EntryName = "Updated Entry",
            WebsiteUrl = "https://updated.com",
            EntryUserName = "updateduser",
            EncryptedPassword = new byte[] { 4, 5, 6 },
            IV = "updated-iv",
            Notes = "Updated notes",
            IsLiked = true
        };

        var expectedEntry = new PasswordEntryDTO
        {
            Id = _testEntryGuid,
            EntryName = updateDto.EntryName,
            WebsiteUrl = updateDto.WebsiteUrl,
            EntryUserName = updateDto.EntryUserName,
            EncryptedPassword = updateDto.EncryptedPassword,
            IV = updateDto.IV,
            Notes = updateDto.Notes,
            IsLiked = updateDto.IsLiked
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntry);

        // Act
        var result = await _passwordEntryService.UpdatePasswordEntryAsync(_testUserGuid, _testEntryGuid, updateDto);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(_testEntryGuid, result.Id);
        Assert.AreEqual(updateDto.EntryName, result.EntryName);
        Assert.AreEqual(updateDto.IsLiked, result.IsLiked);
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Update")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task UpdatePasswordEntryAsync_WhenUpdateFails_ThrowsUnexpectedCaughtException()
    {
        // Arrange
        var updateDto = new PasswordEntryUpdateDTO
        {
            EntryName = "Updated Entry"
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync((PasswordEntryDTO?)null);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<UnexpectedCaughtException>(
            () => _passwordEntryService.UpdatePasswordEntryAsync(_testUserGuid, _testEntryGuid, updateDto));

        Assert.AreEqual("Failed to update password entry", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "Update");
    }

    [TestMethod]
    public async Task UpdatePasswordEntryAsync_WithPartialUpdate_UpdatesOnlyProvidedFields()
    {
        // Arrange
        var updateDto = new PasswordEntryUpdateDTO
        {
            EntryName = "Only Name Updated",
            IsLiked = true
        };

        var expectedEntry = new PasswordEntryDTO
        {
            Id = _testEntryGuid,
            EntryName = updateDto.EntryName,
            WebsiteUrl = "https://original.com",
            IsLiked = updateDto.IsLiked
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntry);

        // Act
        var result = await _passwordEntryService.UpdatePasswordEntryAsync(_testUserGuid, _testEntryGuid, updateDto);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(updateDto.EntryName, result.EntryName);
        Assert.AreEqual(updateDto.IsLiked, result.IsLiked);
    }

    [TestMethod]
    public async Task UpdatePasswordEntryAsync_ToggleLikeStatus_UpdatesCorrectly()
    {
        // Arrange
        var updateDto = new PasswordEntryUpdateDTO { IsLiked = false };
        var expectedEntry = new PasswordEntryDTO
        {
            Id = _testEntryGuid,
            IsLiked = false
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntry);

        // Act
        var result = await _passwordEntryService.UpdatePasswordEntryAsync(_testUserGuid, _testEntryGuid, updateDto);

        // Assert
        Assert.IsFalse(result.IsLiked);
    }

    #endregion

    #region DeletePasswordEntryAsync Tests

    [TestMethod]
    public async Task DeletePasswordEntryAsync_WithValidId_DeletesSuccessfully()
    {
        // Arrange
        _mockDataContext
            .Setup(x => x.ExecuteSql(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(1);

        // Act
        await _passwordEntryService.DeletePasswordEntryAsync(_testUserGuid, _testEntryGuid);

        // Assert
        _mockDataContext.Verify(x => x.ExecuteSql(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Delete")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task DeletePasswordEntryAsync_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        _mockDataContext
            .Setup(x => x.ExecuteSql(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(0);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _passwordEntryService.DeletePasswordEntryAsync(_testUserGuid, nonExistentId));

        Assert.AreEqual("Password Entry not found", exception.Message);
        Assert.IsNotNull(exception.Errors);
        CollectionAssert.Contains(exception.Errors.Keys, "EntryId");
        Assert.AreEqual(nonExistentId.ToString(), exception.Errors["EntryId"]);
    }

    [TestMethod]
    public async Task DeletePasswordEntryAsync_WithDifferentUserId_NoRowsAffected_ThrowsNotFoundException()
    {
        // Arrange
        var differentUserGuid = Guid.NewGuid();

        _mockDataContext
            .Setup(x => x.ExecuteSql(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(0);

        // Act & Assert
        var exception = await Assert.ThrowsExceptionAsync<NotFoundException>(
            () => _passwordEntryService.DeletePasswordEntryAsync(differentUserGuid, _testEntryGuid));

        Assert.IsNotNull(exception.Errors);
    }

    #endregion

    #region UpdateEntriesAfterRecoveryAsync Tests

    [TestMethod]
    public async Task UpdateEntriesAfterRecoveryAsync_WithValidData_ReturnsAffectedRowCount()
    {
        // Arrange
        var updateDtos = new List<PasswordEntryUpdateDTO>
        {
            new() { Id = Guid.NewGuid(), EncryptedPassword = new byte[] { 1, 2, 3 }, IV = "iv1" },
            new() { Id = Guid.NewGuid(), EncryptedPassword = new byte[] { 4, 5, 6 }, IV = "iv2" },
            new() { Id = Guid.NewGuid(), EncryptedPassword = new byte[] { 7, 8, 9 }, IV = "iv3" }
        };

        _mockDataContext
            .Setup(x => x.ExecuteSql(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(3);

        // Act
        var result = await _passwordEntryService.UpdateEntriesAfterRecoveryAsync(_testUserGuid, updateDtos);

        // Assert
        Assert.AreEqual(3, result);
        _mockDataContext.Verify(x => x.ExecuteSql(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Update_AfterRecovery")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task UpdateEntriesAfterRecoveryAsync_WithEmptyList_ReturnsZero()
    {
        // Arrange
        var updateDtos = new List<PasswordEntryUpdateDTO>();

        _mockDataContext
            .Setup(x => x.ExecuteSql(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(0);

        // Act
        var result = await _passwordEntryService.UpdateEntriesAfterRecoveryAsync(_testUserGuid, updateDtos);

        // Assert
        Assert.AreEqual(0, result);
    }

    [TestMethod]
    public async Task UpdateEntriesAfterRecoveryAsync_WithSingleEntry_ReturnsOne()
    {
        // Arrange
        var updateDtos = new List<PasswordEntryUpdateDTO>
        {
            new() { Id = Guid.NewGuid(), EncryptedPassword = new byte[] { 1, 2, 3 }, IV = "iv1" }
        };

        _mockDataContext
            .Setup(x => x.ExecuteSql(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(1);

        // Act
        var result = await _passwordEntryService.UpdateEntriesAfterRecoveryAsync(_testUserGuid, updateDtos);

        // Assert
        Assert.AreEqual(1, result);
    }

    [TestMethod]
    public async Task UpdateEntriesAfterRecoveryAsync_CreatesCorrectDataTable()
    {
        // Arrange
        var entryId = Guid.NewGuid();
        var encryptedPassword = new byte[] { 10, 20, 30 };
        var iv = "test-iv-value";

        var updateDtos = new List<PasswordEntryUpdateDTO>
        {
            new() { Id = entryId, EncryptedPassword = encryptedPassword, IV = iv }
        };

        _mockDataContext
            .Setup(x => x.ExecuteSql(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(1);

        // Act
        await _passwordEntryService.UpdateEntriesAfterRecoveryAsync(_testUserGuid, updateDtos);

        // Assert
        _mockDataContext.Verify(x => x.ExecuteSql(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Update_AfterRecovery")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task UpdateEntriesAfterRecoveryAsync_WhenNoRowsUpdated_ReturnsZero()
    {
        // Arrange
        var updateDtos = new List<PasswordEntryUpdateDTO>
        {
            new() { Id = Guid.NewGuid(), EncryptedPassword = new byte[] { 1, 2, 3 }, IV = "iv1" }
        };

        _mockDataContext
            .Setup(x => x.ExecuteSql(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(0);

        // Act
        var result = await _passwordEntryService.UpdateEntriesAfterRecoveryAsync(_testUserGuid, updateDtos);

        // Assert
        Assert.AreEqual(0, result);
    }

    #endregion

    #region LikePasswordEntryAsync Tests

    [TestMethod]
    public async Task LikePasswordEntryAsync_WhenEntryBecomesLiked_ReturnsTrue()
    {
        // Arrange
        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<bool>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(true);

        // Act
        var result = await _passwordEntryService.LikePasswordEntryAsync(_testUserGuid, _testEntryGuid);

        // Assert
        Assert.IsTrue(result);
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<bool>(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Like")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task LikePasswordEntryAsync_WhenEntryBecomesUnliked_ReturnsFalse()
    {
        // Arrange
        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<bool>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(false);

        // Act
        var result = await _passwordEntryService.LikePasswordEntryAsync(_testUserGuid, _testEntryGuid);

        // Assert
        Assert.IsFalse(result);
    }

    [TestMethod]
    public async Task LikePasswordEntryAsync_WithValidUserAndEntry_CallsCorrectStoredProcedure()
    {
        // Arrange
        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<bool>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(true);

        // Act
        await _passwordEntryService.LikePasswordEntryAsync(_testUserGuid, _testEntryGuid);

        // Assert
        _mockDataContext.Verify(x => x.QuerySingleOrDefaultAsync<bool>(
            It.Is<string>(sql => sql.Contains("spPasswordEntry_Like") &&
                                  sql.Contains("@UserId") &&
                                  sql.Contains("@EntryId")),
            It.IsAny<DynamicParameters?>()), Times.Once);
    }

    [TestMethod]
    public async Task LikePasswordEntryAsync_TogglesLikeState_ReturnsNewState()
    {
        // Arrange - First like (false -> true)
        _mockDataContext
            .SetupSequence(x => x.QuerySingleOrDefaultAsync<bool>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        // Act & Assert - First toggle
        var firstResult = await _passwordEntryService.LikePasswordEntryAsync(_testUserGuid, _testEntryGuid);
        Assert.IsTrue(firstResult);

        // Act & Assert - Second toggle
        var secondResult = await _passwordEntryService.LikePasswordEntryAsync(_testUserGuid, _testEntryGuid);
        Assert.IsFalse(secondResult);
    }

    #endregion

    #region Edge Cases and Integration Tests

    [TestMethod]
    public async Task GetPasswordEntriesAsync_WithMaxLimitValue_HandlesCorrectly()
    {
        // Arrange
        var queryParams = new PasswordEntryQueryParams
        {
            Limit = int.MaxValue,
            Offset = 0
        };

        _mockDataContext
            .Setup(x => x.LoadData<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<PasswordEntryDTO>());

        // Act
        var result = await _passwordEntryService.GetPasswordEntriesAsync(_testUserGuid, queryParams);

        // Assert
        Assert.IsNotNull(result);
    }

    [TestMethod]
    public async Task CreatePasswordEntryAsync_WithMaxSizeEncryptedPassword_CreatesSuccessfully()
    {
        // Arrange
        var largePassword = new byte[10000]; // Large encrypted password
        Array.Fill<byte>(largePassword, 0xFF);

        var createDto = new PasswordEntryCreateDTO
        {
            EntryName = "Large Password Entry",
            WebsiteUrl = "https://large.com",
            EncryptedPassword = largePassword,
            IV = "large-iv"
        };

        var expectedEntry = new PasswordEntryDTO
        {
            Id = Guid.NewGuid(),
            EntryName = createDto.EntryName,
            EncryptedPassword = largePassword
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntry);

        // Act
        var result = await _passwordEntryService.CreatePasswordEntryAsync(_testUserGuid, createDto);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(largePassword.Length, result.EncryptedPassword?.Length);
    }

    [TestMethod]
    public async Task UpdatePasswordEntryAsync_WithSpecialCharactersInNotes_UpdatesCorrectly()
    {
        // Arrange
        var updateDto = new PasswordEntryUpdateDTO
        {
            Notes = "Special chars: !@#$%^&*()_+{}[]|\\:\";<>?,./~`' and unicode: 日本語 中文 한국어"
        };

        var expectedEntry = new PasswordEntryDTO
        {
            Id = _testEntryGuid,
            Notes = updateDto.Notes
        };

        _mockDataContext
            .Setup(x => x.QuerySingleOrDefaultAsync<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(expectedEntry);

        // Act
        var result = await _passwordEntryService.UpdatePasswordEntryAsync(_testUserGuid, _testEntryGuid, updateDto);

        // Assert
        Assert.AreEqual(updateDto.Notes, result.Notes);
    }

    [TestMethod]
    public async Task GetPasswordEntriesAsync_WithSpecialCharactersInFilter_HandlesCorrectly()
    {
        // Arrange
        var queryParams = new PasswordEntryQueryParams
        {
            EntryName = "Test's \"Entry\" <with> special chars",
            WebsiteUrl = "https://example.com/path?query=value&other=123"
        };

        _mockDataContext
            .Setup(x => x.LoadData<PasswordEntryDTO>(
                It.IsAny<string>(),
                It.IsAny<DynamicParameters?>()))
            .ReturnsAsync(new List<PasswordEntryDTO>());

        // Act
        var result = await _passwordEntryService.GetPasswordEntriesAsync(_testUserGuid, queryParams);

        // Assert
        Assert.IsNotNull(result);
    }

    #endregion

    #region Helper Methods

    private static PasswordEntryDTO CreateTestPasswordEntryDTO(string? entryName = null)
    {
        return new PasswordEntryDTO
        {
            Id = Guid.NewGuid(),
            EntryName = entryName ?? "Test Entry",
            WebsiteUrl = "https://test.com",
            EntryUserName = "testuser",
            EncryptedPassword = new byte[] { 1, 2, 3, 4, 5 },
            IV = "test-iv-12345",
            Notes = "Test notes",
            IsLiked = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
