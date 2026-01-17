USE PasswordDB;

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_User_SELECT_ForHash
    @Email NVARCHAR(100)
AS
BEGIN
    SELECT PasswordHash, PasswordSalt
    FROM PasswordSchema.[User]
    WHERE Email = @Email;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_User_SELECT_ByIdOrEmail
    @Email NVARCHAR(100) = NULL,
    @Id UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SELECT
        u.Id,
        u.UserName,
        u.Email,
        u.CreatedAt,
        u.UpdatedAt,
        s.MasterPasswordTTLInMinutes,
        s.AutoLockTimeInMinutes,
        s.Theme,
        s.MinimumPasswordStrength,
        s.MasterPasswordStorageMode,
        s.UserId,
        s.CreatedAt AS SettingsCreatedAt,
        s.UpdatedAt AS SettingsUpdatedAt,
        m.MasterPasswordSalt,
        m.MasterEncryptedPasswordTest,
        m.MasterEncryptedPasswordIV,
        m.CreatedAt AS MasterPasswordCreatedAt,
        m.UpdatedAt AS MasterPasswordUpdatedAt
    FROM PasswordSchema.[User] u
        INNER JOIN PasswordSchema.UserSettings s ON u.Id = s.UserId
        INNER JOIN PasswordSchema.UserMasterPassword m ON u.Id = m.UserId
    WHERE u.Email = @Email OR u.Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_User_SELECT_ForExisting
    @Email NVARCHAR(100)
AS
BEGIN
    SELECT Email
    FROM PasswordSchema.[User]
    WHERE Email = @Email;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_User_INSERT_CreateNewUser
    @Email NVARCHAR(100),
    @UserName NVARCHAR(100),
    @PasswordHash VARBINARY(MAX),
    @PasswordSalt VARBINARY(MAX)

AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewUserId TABLE (Id UNIQUEIDENTIFIER);

    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO PasswordSchema.[User]
        (Email, Username, PasswordHash, PasswordSalt)
    OUTPUT INSERTED.Id INTO @NewUserId
    VALUES
        (@Email, @Username, @PasswordHash, @PasswordSalt);
        
        INSERT INTO PasswordSchema.UserSettings
        (UserId)
    SELECT Id
    FROM @NewUserId;
        
        SELECT
        u.Id,
        u.UserName,
        u.Email,
        u.CreatedAt,
        u.UpdatedAt,
        s.MasterPasswordTTLInMinutes,
        s.AutoLockTimeInMinutes,
        s.Theme,
        s.MinimumPasswordStrength,
        s.MasterPasswordStorageMode,
        s.UserId,
        s.CreatedAt AS SettingsCreatedAt,
        s.UpdatedAt AS SettingsUpdatedAt,
        m.MasterPasswordSalt,
        m.MasterEncryptedPasswordTest,
        m.MasterEncryptedPasswordIV,
        m.CreatedAt AS MasterPasswordCreatedAt,
        m.UpdatedAt AS MasterPasswordUpdatedAt
    FROM PasswordSchema.[User] u
        INNER JOIN PasswordSchema.UserSettings s ON u.Id = s.UserId
        INNER JOIN PasswordSchema.UserMasterPassword m ON u.Id = m.UserId
        INNER JOIN @NewUserId n ON u.Id = n.Id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END

GO
