USE PasswordDB;

GO

CREATE OR ALTER PROCEDURE PasswordSchema.spFor_Hash
    @Email NVARCHAR(100)
AS
BEGIN
    SELECT PasswordHash, PasswordSalt
    FROM PasswordSchema.[User]
    WHERE Email = @Email;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.spUser_GetOne
    @Email NVARCHAR(100) = NULL,
    @Id UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SELECT
        u.Id,
        u.UserName,
        u.Email,
        u.MasterPasswordSalt,
        s.MasterPasswordTTLInMinutes,
        s.AutoLockTimeInMinutes,
        s.Theme,
        s.MinimumPasswordStrength,
        s.MasterPasswordStorageMode,
        s.UserId,
        s.CreatedAt ,
        s.UpdatedAt
    FROM PasswordSchema.[User] u
        INNER JOIN PasswordSchema.UserSettings s ON u.Id = s.UserId
    WHERE u.Email = @Email OR u.Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE PasswordSchema.spFor_Existing
    @Email NVARCHAR(100)
AS
BEGIN
    SELECT Email
    FROM PasswordSchema.[User]
    WHERE Email = @Email;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.spUser_Create
    @Email NVARCHAR(100),
    @UserName NVARCHAR(100),
    @PasswordHash VARBINARY(MAX),
    @PasswordSalt VARBINARY(MAX),
    @MasterPasswordSalt VARBINARY(MAX),
    @EncryptedMasterKeyWithRecovery VARBINARY(MAX),
    @RecoveryIV VARBINARY(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewUserId TABLE (Id UNIQUEIDENTIFIER);

    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO PasswordSchema.[User]
        (Email, Username, PasswordHash, PasswordSalt, MasterPasswordSalt,
        EncryptedMasterKeyWithRecovery, RecoveryIV)
    OUTPUT INSERTED.Id INTO @NewUserId
    VALUES
        (@Email, @Username, @PasswordHash, @PasswordSalt,
            @MasterPasswordSalt, @EncryptedMasterKeyWithRecovery, @RecoveryIV);
        
        INSERT INTO PasswordSchema.UserSettings
        (UserId)
    SELECT Id
    FROM @NewUserId;
        
        SELECT
        u.Id,
        u.Email,
        u.Username,
        u.MasterPasswordSalt,
        s.MasterPasswordTTLInMinutes,
        s.AutoLockTimeInMinutes,
        s.Theme,
        s.UserId,
        s.MinimumPasswordStrength,
        s.MasterPasswordStorageMode,
        s.CreatedAt,
        s.UpdatedAt
    FROM PasswordSchema.[User] u
        INNER JOIN PasswordSchema.UserSettings s ON u.Id = s.UserId
        INNER JOIN @NewUserId n ON u.Id = n.Id;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.spUser_Select_MasterPasswordRecoveryData
    @UserId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT EncryptedMasterKeyWithRecovery, RecoveryIV
    FROM PasswordSchema.[User]
    WHERE Id = @UserId;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.spUser_Update_MasterPasswordRecovery
    @UserId UNIQUEIDENTIFIER,
    @EncryptedMasterKeyWithRecovery VARBINARY(MAX),
    @RecoveryIV VARBINARY(MAX),
    @MasterPasswordSalt VARBINARY(MAX)
AS
BEGIN
    UPDATE PasswordSchema.[User]
    SET EncryptedMasterKeyWithRecovery = @EncryptedMasterKeyWithRecovery,
        RecoveryIV = @RecoveryIV,
        MasterPasswordSalt = @MasterPasswordSalt,
        UpdatedAt = GETDATE()
    WHERE Id = @UserId;

    SELECT Id, Email, Username, MasterPasswordSalt
    FROM PasswordSchema.[User]
    WHERE Id = @UserId;
END