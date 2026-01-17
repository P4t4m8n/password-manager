USE PasswordDB;

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_UserMasterPassword_SELECT_MasterPasswordRecoveryData
    @UserId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT EncryptedMasterKeyWithRecovery, RecoveryIV
    FROM PasswordSchema.UserMasterPassword
    WHERE UserId = @UserId;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_UserMasterPassword_SELECT_MasterPasswordTestData
    @UserId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT MasterPasswordSalt, MasterEncryptedPasswordTest, MasterEncryptedPasswordIV
    FROM PasswordSchema.UserMasterPassword
    WHERE UserId = @UserId;
END
GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_UserMasterPassword_INSERT
    @UserId UNIQUEIDENTIFIER,
    @EncryptedMasterKeyWithRecovery VARBINARY(MAX),
    @RecoveryIV VARBINARY(MAX),
    @MasterEncryptedPasswordTest VARBINARY(MAX),
    @MasterEncryptedPasswordIV NVARCHAR(255),
    @MasterPasswordSalt VARBINARY(MAX)
AS
BEGIN
    INSERT INTO PasswordSchema.UserMasterPassword
        (UserId, EncryptedMasterKeyWithRecovery, RecoveryIV, MasterEncryptedPasswordTest, MasterEncryptedPasswordIV, MasterPasswordSalt)
    OUTPUT
    INSERTED.Id,
    INSERTED.UserId,
    INSERTED.EncryptedMasterKeyWithRecovery,
    INSERTED.RecoveryIV,
    INSERTED.MasterEncryptedPasswordTest,
    INSERTED.MasterEncryptedPasswordIV,
    INSERTED.MasterPasswordSalt,
    INSERTED.CreatedAt,
    INSERTED.UpdatedAt
    VALUES
        (@UserId, @EncryptedMasterKeyWithRecovery, @RecoveryIV, @MasterEncryptedPasswordTest, @MasterEncryptedPasswordIV, @MasterPasswordSalt);
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_UserMasterPassword_UPDATE
    @UserId UNIQUEIDENTIFIER,
    @EncryptedMasterKeyWithRecovery VARBINARY(MAX),
    @RecoveryIV VARBINARY(MAX),
    @MasterPasswordSalt VARBINARY(MAX),
    @MasterEncryptedPasswordTest VARBINARY(MAX),
    @MasterEncryptedPasswordIV NVARCHAR(255)
AS
BEGIN
    UPDATE PasswordSchema.UserMasterPassword
    SET EncryptedMasterKeyWithRecovery = @EncryptedMasterKeyWithRecovery,
        RecoveryIV = @RecoveryIV,
        MasterPasswordSalt = @MasterPasswordSalt,
        UpdatedAt = GETDATE()

    OUTPUT INSERTED.MasterPasswordSalt,
           INSERTED.EncryptedMasterKeyWithRecovery,
           INSERTED.RecoveryIV,
           INSERTED.MasterEncryptedPasswordTest,
           INSERTED.MasterEncryptedPasswordIV,
           INSERTED.CreatedAt,
           INSERTED.UpdatedAt

    WHERE UserId = @UserId;
END