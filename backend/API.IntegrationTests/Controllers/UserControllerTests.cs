using System.Net;
using System.Net.Http.Json;
using API.Dtos.Http;
using API.Exceptions;
using API.IntegrationTests.Infrastructure;
using Dapper;
using Moq;

namespace API.IntegrationTests.Controllers;

[TestClass]
public class UserControllerTests : IntegrationTestBase
{
    #region DELETE /api/User/{userId} Tests

    [TestMethod]
    public async Task DeleteUser_WhenUserExists_Returns200()
    {
        // Arrange
        var userId = Guid.NewGuid();

        Factory.MockDataContext
            .Setup(x => x.ExecuteSql(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
            .ReturnsAsync(1); // 1 row affected

        // Act
        var response = await Client.DeleteAsync($"/api/User/{userId}");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<object>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("Entry deleted successfully.", result.Message);
        Assert.AreEqual(200, result.StatusCode);
    }

    [TestMethod]
    public async Task DeleteUser_WhenUserNotExists_Returns404()
    {
        // Arrange
        var userId = Guid.NewGuid();

        Factory.MockDataContext
            .Setup(x => x.ExecuteSql(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
            .ReturnsAsync(0); // 0 rows affected

        // Act
        var response = await Client.DeleteAsync($"/api/User/{userId}");

        // Assert
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
    }

    [TestMethod]
    public async Task DeleteUser_WithInvalidGuid_Returns400()
    {
        // Arrange
        var invalidGuid = "not-a-valid-guid";

        // Act
        var response = await Client.DeleteAsync($"/api/User/{invalidGuid}");

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task DeleteUser_CallsDataContextWithCorrectQuery()
    {
        // Arrange
        var userId = Guid.NewGuid();
        string? capturedQuery = null;

        Factory.MockDataContext
            .Setup(x => x.ExecuteSql(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
            .Callback<string, DynamicParameters>((query, _) => capturedQuery = query)
            .ReturnsAsync(1);

        // Act
        await Client.DeleteAsync($"/api/User/{userId}");

        // Assert
        Assert.IsNotNull(capturedQuery);
        Assert.IsTrue(capturedQuery.Contains("DELETE FROM PasswordSchema.[User]"));
        Assert.IsTrue(capturedQuery.Contains("@UserId"));
    }

    [TestMethod]
    public async Task DeleteUser_NoAuthorizationRequired_SucceedsWithoutToken()
    {
        // Arrange - Note: UserController doesn't have [Authorize] attribute
        var userId = Guid.NewGuid();

        Factory.MockDataContext
            .Setup(x => x.ExecuteSql(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
            .ReturnsAsync(1);

        // Act - No authentication
        var response = await Client.DeleteAsync($"/api/User/{userId}");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
    }

    [TestMethod]
    public async Task DeleteUser_WithEmptyGuid_Returns400OrNotFound()
    {
        // Arrange
        var emptyGuid = Guid.Empty;

        Factory.MockDataContext
            .Setup(x => x.ExecuteSql(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
            .ReturnsAsync(0);

        // Act
        var response = await Client.DeleteAsync($"/api/User/{emptyGuid}");

        // Assert - Empty GUID is valid format but user won't exist
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
    }

    [TestMethod]
    public async Task DeleteUser_MultipleDeletes_OnlyFirstSucceeds()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var callCount = 0;

        Factory.MockDataContext
            .Setup(x => x.ExecuteSql(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
            .ReturnsAsync(() =>
            {
                callCount++;
                return callCount == 1 ? 1 : 0; // First call returns 1, subsequent return 0
            });

        // Act
        var response1 = await Client.DeleteAsync($"/api/User/{userId}");
        var response2 = await Client.DeleteAsync($"/api/User/{userId}");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response1.StatusCode);
        Assert.AreEqual(HttpStatusCode.NotFound, response2.StatusCode);
    }

    #endregion
}
