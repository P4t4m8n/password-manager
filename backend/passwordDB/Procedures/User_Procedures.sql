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

    @Email NVARCHAR(100)=NULL,
    @Id UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SELECT Id, UserName, Email, MasterPasswordSalt
    FROM PasswordSchema.[User]
    WHERE Email = @Email OR Id = @Id;

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
    @MasterPasswordSalt VARBINARY(MAX) ,
    @EncryptedMasterKeyWithRecovery VARBINARY(MAX) ,
    @RecoveryIV VARBINARY(MAX)
AS
BEGIN
    INSERT INTO PasswordSchema.[User]
        (Email,Username, PasswordHash, PasswordSalt, MasterPasswordSalt, EncryptedMasterKeyWithRecovery, RecoveryIV)
    OUTPUT
    INSERTED.Id,
    INSERTED.Email,
    INSERTED.Username,
    INSERTED.MasterPasswordSalt
    VALUES
        (@Email, @Username, @PasswordHash, @PasswordSalt, @MasterPasswordSalt, @EncryptedMasterKeyWithRecovery, @RecoveryIV);
END