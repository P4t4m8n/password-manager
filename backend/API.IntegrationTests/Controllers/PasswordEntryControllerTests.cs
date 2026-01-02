using System.Net;
using System.Net.Http.Json;
using API.Dtos.Http;
using API.Dtos.PasswordEntry;
using API.IntegrationTests.Infrastructure;
using Moq;

namespace API.IntegrationTests.Controllers;

[TestClass]
public class PasswordEntryControllerTests : IntegrationTestBase
{
    [TestInitialize]
    public void TestSetup()
    {
        // Most password entry endpoints require authentication
        AuthenticateClient();
    }

    #region GET /api/Password-entry Tests

    [TestMethod]
    public async Task GetEntries_WhenAuthenticated_Returns200WithEntries()
    {
        // Arrange
        var expectedEntries = new List<PasswordEntryDTO>
        {
            CreateTestPasswordEntryDTO("Gmail"),
            CreateTestPasswordEntryDTO("GitHub")
        };

        Factory.MockPasswordEntryService
            .Setup(x => x.GetPasswordEntriesAsync(
                It.IsAny<Guid>(),
                It.IsAny<API.QueryParams.PasswordEntryQueryParams>()))
            .ReturnsAsync(expectedEntries);

        // Act
        var response = await Client.GetAsync("/api/Password-entry");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<List<PasswordEntryDTO>>>();
        Assert.IsNotNull(result);
        Assert.AreEqual(2, result.Data?.Count);
        Assert.AreEqual("Entries retrieved successfully.", result.Message);
    }

    [TestMethod]
    public async Task GetEntries_WhenNotAuthenticated_Returns401()
    {
        // Arrange
        ClearAuthentication();

        // Act
        var response = await Client.GetAsync("/api/Password-entry");

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task GetEntries_WithQueryParams_CallsServiceWithParams()
    {
        // Arrange
        Factory.MockPasswordEntryService
            .Setup(x => x.GetPasswordEntriesAsync(
                It.IsAny<Guid>(),
                It.IsAny<API.QueryParams.PasswordEntryQueryParams>()))
            .ReturnsAsync(new List<PasswordEntryDTO>());

        // Act
        var response = await Client.GetAsync("/api/Password-entry?entryName=Gmail&limit=5&offset=10");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        Factory.MockPasswordEntryService.Verify(
            x => x.GetPasswordEntriesAsync(It.IsAny<Guid>(), It.IsAny<API.QueryParams.PasswordEntryQueryParams>()),
            Times.Once);
    }

    #endregion

    #region GET /api/Password-entry/{id} Tests

    [TestMethod]
    public async Task GetEntryById_WhenExists_Returns200WithEntry()
    {
        // Arrange
        var entryId = Guid.NewGuid();
        var expectedEntry = CreateTestPasswordEntryDTO("Gmail");
        expectedEntry.Id = entryId;

        Factory.MockPasswordEntryService
            .Setup(x => x.GetPasswordEntryByIdAsync(It.IsAny<Guid>(), entryId))
            .ReturnsAsync(expectedEntry);

        // Act
        var response = await Client.GetAsync($"/api/Password-entry/{entryId}");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<PasswordEntryDTO>>();
        Assert.IsNotNull(result?.Data);
        Assert.AreEqual(entryId, result.Data.Id);
    }

    [TestMethod]
    public async Task GetEntryById_WhenNotExists_Returns404()
    {
        // Arrange
        var entryId = Guid.NewGuid();

        Factory.MockPasswordEntryService
            .Setup(x => x.GetPasswordEntryByIdAsync(It.IsAny<Guid>(), entryId))
            .ThrowsAsync(new API.Exceptions.NotFoundException("Password Entry not found"));

        // Act
        var response = await Client.GetAsync($"/api/Password-entry/{entryId}");

        // Assert
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region POST /api/Password-entry Tests

    [TestMethod]
    public async Task CreateEntry_WithValidData_Returns201()
    {
        // Arrange
        var createDto = new PasswordEntryCreateDTO
        {
            EntryName = "New Entry",
            WebsiteUrl = "https://example.com",
            EntryUserName = "user@example.com",
            EncryptedPassword = new byte[] { 1, 2, 3, 4 },
            IV = "test-iv",
            Notes = "Test notes"
        };

        var createdEntry = CreateTestPasswordEntryDTO("New Entry");

        Factory.MockPasswordEntryService
            .Setup(x => x.CreatePasswordEntryAsync(It.IsAny<Guid>(), It.IsAny<PasswordEntryCreateDTO>()))
            .ReturnsAsync(createdEntry);

        // Act
        var response = await Client.PostAsJsonAsync("/api/Password-entry", createDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<PasswordEntryDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("Entry created successfully.", result.Message);
    }

    [TestMethod]
    public async Task CreateEntry_WithMissingRequiredFields_Returns400()
    {
        // Arrange
        var createDto = new { Notes = "Only notes, missing required fields" };

        // Act
        var response = await Client.PostAsJsonAsync("/api/Password-entry", createDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    #endregion

    #region PATCH /api/Password-entry/{id} Tests

    [TestMethod]
    public async Task UpdateEntry_WithValidData_Returns200()
    {
        // Arrange
        var entryId = Guid.NewGuid();
        var updateDto = new PasswordEntryUpdateDTO
        {
            EntryName = "Updated Entry",
            IsLiked = true
        };

        var updatedEntry = CreateTestPasswordEntryDTO("Updated Entry");
        updatedEntry.Id = entryId;
        updatedEntry.IsLiked = true;

        Factory.MockPasswordEntryService
            .Setup(x => x.UpdatePasswordEntryAsync(It.IsAny<Guid>(), entryId, It.IsAny<PasswordEntryUpdateDTO>()))
            .ReturnsAsync(updatedEntry);

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/Password-entry/{entryId}", updateDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<PasswordEntryDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("Entry updated successfully.", result.Message);
    }

    #endregion

    #region DELETE /api/Password-entry/{id} Tests

    [TestMethod]
    public async Task DeleteEntry_WhenExists_Returns200()
    {
        // Arrange
        var entryId = Guid.NewGuid();

        Factory.MockPasswordEntryService
            .Setup(x => x.DeletePasswordEntryAsync(It.IsAny<Guid>(), entryId))
            .Returns(Task.CompletedTask);

        // Act
        var response = await Client.DeleteAsync($"/api/Password-entry/{entryId}");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<object>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("Entry deleted successfully.", result.Message);
    }

    [TestMethod]
    public async Task DeleteEntry_WhenNotExists_Returns404()
    {
        // Arrange
        var entryId = Guid.NewGuid();

        Factory.MockPasswordEntryService
            .Setup(x => x.DeletePasswordEntryAsync(It.IsAny<Guid>(), entryId))
            .ThrowsAsync(new API.Exceptions.NotFoundException("Password Entry not found"));

        // Act
        var response = await Client.DeleteAsync($"/api/Password-entry/{entryId}");

        // Assert
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region Helper Methods

    private static PasswordEntryDTO CreateTestPasswordEntryDTO(string entryName)
    {
        return new PasswordEntryDTO
        {
            Id = Guid.NewGuid(),
            EntryName = entryName,
            WebsiteUrl = $"https://{entryName.ToLower()}.com",
            EntryUserName = $"user@{entryName.ToLower()}.com",
            EncryptedPassword = new byte[] { 1, 2, 3, 4, 5 },
            IV = "test-iv-12345",
            Notes = $"Notes for {entryName}",
            IsLiked = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
