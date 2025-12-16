USE PasswordDB;

GO

CREATE OR ALTER PROCEDURE PasswordSchema.spUserSettings_Select_ByUserId
    @UserId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT
        MasterPasswordTTLInMinutes,
        AutoLockTimeInMinutes,
        Theme,
        MinimumPasswordStrength,
        MasterPasswordStorageMode,
        UpdatedAt
    FROM PasswordSchema.UserSettings
    WHERE UserId = @UserId;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.spUserSettings_Update
    @UserId UNIQUEIDENTIFIER,
    @MasterPasswordTTLInMinutes INT = 30,
    @AutoLockTimeInMinutes INT = 5,
    @Theme NVARCHAR(20) = 'light',
    @MinimumPasswordStrength  NVARCHAR(20) = 'veryStrong',
    @MasterPasswordStorageMode NVARCHAR(20) = 'none'
AS
BEGIN
    UPDATE PasswordSchema.UserSettings
    SET
        MasterPasswordTTLInMinutes = CASE WHEN @MasterPasswordTTLInMinutes IS NOT NULL THEN @MasterPasswordTTLInMinutes ELSE MasterPasswordTTLInMinutes END,
        AutoLockTimeInMinutes = CASE WHEN @AutoLockTimeInMinutes IS NOT NULL THEN @AutoLockTimeInMinutes ELSE AutoLockTimeInMinutes END,
        Theme = CASE WHEN @Theme IS NOT NULL THEN @Theme ELSE Theme END,
        MinimumPasswordStrength = CASE WHEN @MinimumPasswordStrength IS NOT NULL THEN @MinimumPasswordStrength ELSE MinimumPasswordStrength END,
        MasterPasswordStorageMode = CASE WHEN @MasterPasswordStorageMode IS NOT NULL THEN @MasterPasswordStorageMode ELSE MasterPasswordStorageMode END,
        UpdatedAt = GETUTCDATE()
    WHERE UserId = @UserId;
    SELECT *
    FROM PasswordSchema.UserSettings
    WHERE UserId = @UserId;
END
GO