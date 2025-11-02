USE PasswordDB;

GO

CREATE OR ALTER PROCEDURE PasswordSchema.spFor_Hash
    @Email NVARCHAR(100)
AS
BEGIN
    SELECT PasswordHash, Salt
    FROM PasswordSchema.[User]
    WHERE Email = @Email;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.spUser_GetOne

    @Email NVARCHAR(100)=NULL,
    @Id UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SELECT Id, UserName, Email
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
    @Salt VARBINARY(MAX)
AS
BEGIN
    INSERT INTO PasswordSchema.[User]
        (Email, PasswordHash, Salt, Username)
    OUTPUT
    INSERTED.Id,
    INSERTED.Email,
    INSERTED.Username
    VALUES
        (@Email, @PasswordHash, @Salt, @Username);
END