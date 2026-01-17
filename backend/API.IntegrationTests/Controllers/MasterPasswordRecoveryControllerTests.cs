using System.Net;
using System.Net.Http.Json;
using API.Dtos.Http;
using API.Dtos.User;
using API.IntegrationTests.Infrastructure;
using Moq;

namespace API.IntegrationTests.Controllers;

[TestClass]
public class MasterPasswordRecoveryControllerTests : IntegrationTestBase
{
    #region GET /api/Master-password-recovery Tests

    [TestMethod]
    public async Task GetMasterPasswordRecovery_WhenAuthenticated_Returns200WithData()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedRecoveryData = new MasterKeyRecoveryResponseDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 },
            RecoveryIV = new byte[] { 10, 20, 30, 40 }
        };

        _ = Factory.MockMasterPasswordRecoveryService
            .Setup(x => x.GetMasterPasswordRecoveryAsync(It.IsAny<Guid>()))
            .ReturnsAsync(expectedRecoveryData);

        AuthenticateClientAs(userId);

        // Act
        var response = await Client.GetAsync("/api/Master-password-recovery");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<MasterKeyRecoveryResponseDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual(200, result.StatusCode);
        Assert.AreEqual("Master password recovery data retrieved successfully.", result.Message);
        Assert.IsNotNull(result.Data);
    }

    [TestMethod]
    public async Task GetMasterPasswordRecovery_WhenNotAuthenticated_Returns401()
    {
        // Arrange - No authentication

        // Act
        var response = await Client.GetAsync("/api/Master-password-recovery");

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task GetMasterPasswordRecovery_WhenNoRecoveryData_Returns200WithNullData()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _ = Factory.MockMasterPasswordRecoveryService
            .Setup(x => x.GetMasterPasswordRecoveryAsync(It.IsAny<Guid>()))
            .ReturnsAsync((MasterKeyRecoveryResponseDTO)null!);

        AuthenticateClientAs(userId);

        // Act
        var response = await Client.GetAsync("/api/Master-password-recovery");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<MasterKeyRecoveryResponseDTO>>();
        Assert.IsNotNull(result);
        Assert.AreEqual(200, result.StatusCode);
    }

    [TestMethod]
    public async Task GetMasterPasswordRecovery_CallsServiceWithCorrectUserId()
    {
        // Arrange
        var userId = Guid.NewGuid();
        Guid? capturedUserId = null;

        _ = Factory.MockMasterPasswordRecoveryService
            .Setup(x => x.GetMasterPasswordRecoveryAsync(It.IsAny<Guid>()))
            .Callback<Guid>(id => capturedUserId = id)
            .ReturnsAsync(new MasterKeyRecoveryResponseDTO
            {
                EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3 },
                RecoveryIV = new byte[] { 4, 5, 6 }
            });

        AuthenticateClientAs(userId);

        // Act
        _ = await Client.GetAsync("/api/Master-password-recovery");

        // Assert
        Assert.IsNotNull(capturedUserId);
        Assert.AreEqual(userId, capturedUserId.Value);
    }

    #endregion

    #region PATCH /api/Master-password-recovery Tests

    [TestMethod]
    public async Task UpdateMasterPasswordRecovery_WithValidData_Returns201()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var updateDto = new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 },
            RecoveryIV = new byte[] { 10, 20, 30, 40 },
            MasterPasswordSalt = new byte[] { 100, 101, 102, 103 }
        };

        var returnedSalt = new byte[] { 200, 201, 202, 203 };

        _ = Factory.MockMasterPasswordRecoveryService
            .Setup(x => x.UpdateUserMasterPasswordAsync(It.IsAny<Guid>(), It.IsAny<MasterKeyRecoveryEditDTO>()))
            .ReturnsAsync(returnedSalt);

        AuthenticateClientAs(userId);

        // Act
        var response = await Client.PatchAsJsonAsync("/api/Master-password-recovery", updateDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecovery_WhenNotAuthenticated_Returns401()
    {
        // Arrange
        var updateDto = new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3 },
            RecoveryIV = new byte[] { 4, 5, 6 },
            MasterPasswordSalt = new byte[] { 7, 8, 9 }
        };

        // Act
        var response = await Client.PatchAsJsonAsync("/api/Master-password-recovery", updateDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecovery_WithMissingEncryptedKey_Returns400()
    {
        // Arrange
        var userId = Guid.NewGuid();
        AuthenticateClientAs(userId);

        var updateDto = new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = null, // Missing required field
            RecoveryIV = new byte[] { 4, 5, 6 },
            MasterPasswordSalt = new byte[] { 7, 8, 9 }
        };

        // Act
        var response = await Client.PatchAsJsonAsync("/api/Master-password-recovery", updateDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecovery_WithMissingRecoveryIV_Returns400()
    {
        // Arrange
        var userId = Guid.NewGuid();
        AuthenticateClientAs(userId);

        var updateDto = new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3 },
            RecoveryIV = null, // Missing required field
            MasterPasswordSalt = new byte[] { 7, 8, 9 }
        };

        // Act
        var response = await Client.PatchAsJsonAsync("/api/Master-password-recovery", updateDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecovery_WithMissingSalt_Returns400()
    {
        // Arrange
        var userId = Guid.NewGuid();
        AuthenticateClientAs(userId);

        var updateDto = new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3 },
            RecoveryIV = new byte[] { 4, 5, 6 },
            MasterPasswordSalt = null // Missing required field
        };

        // Act
        var response = await Client.PatchAsJsonAsync("/api/Master-password-recovery", updateDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecovery_CallsServiceWithCorrectParameters()
    {
        // Arrange
        var userId = Guid.NewGuid();
        Guid? capturedUserId = null;
        MasterKeyRecoveryEditDTO? capturedDto = null;

        _ = Factory.MockMasterPasswordRecoveryService
            .Setup(x => x.UpdateUserMasterPasswordAsync(It.IsAny<Guid>(), It.IsAny<MasterKeyRecoveryEditDTO>()))
            .Callback<Guid, MasterKeyRecoveryEditDTO>((id, dto) =>
            {
                capturedUserId = id;
                capturedDto = dto;
            })
            .ReturnsAsync(new byte[] { 1, 2, 3 });

        AuthenticateClientAs(userId);

        var updateDto = new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 10, 20, 30 },
            RecoveryIV = new byte[] { 40, 50, 60 },
            MasterPasswordSalt = new byte[] { 70, 80, 90 }
        };

        // Act
        _ = await Client.PatchAsJsonAsync("/api/Master-password-recovery", updateDto);

        // Assert
        Assert.IsNotNull(capturedUserId);
        Assert.AreEqual(userId, capturedUserId.Value);
        Assert.IsNotNull(capturedDto);
    }

    [TestMethod]
    public async Task UpdateMasterPasswordRecovery_ReturnsCorrectMessage()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _ = Factory.MockMasterPasswordRecoveryService
            .Setup(x => x.UpdateUserMasterPasswordAsync(It.IsAny<Guid>(), It.IsAny<MasterKeyRecoveryEditDTO>()))
            .ReturnsAsync(new byte[] { 1, 2, 3 });

        AuthenticateClientAs(userId);

        var updateDto = new MasterKeyRecoveryEditDTO
        {
            EncryptedMasterKeyWithRecovery = new byte[] { 1, 2, 3 },
            RecoveryIV = new byte[] { 4, 5, 6 },
            MasterPasswordSalt = new byte[] { 7, 8, 9 }
        };

        // Act
        var response = await Client.PatchAsJsonAsync("/api/Master-password-recovery", updateDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<HttpResponseDTO<byte[]>>();
        Assert.IsNotNull(result);
        Assert.AreEqual("Master password recovery updated successfully.", result.Message);
        Assert.AreEqual(201, result.StatusCode);
    }

    #endregion
}
