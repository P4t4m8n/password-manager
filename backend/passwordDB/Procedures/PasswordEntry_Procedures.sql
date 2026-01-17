USE PasswordDB;

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_PasswordEntry_SELECT_Many
    @UserId UNIQUEIDENTIFIER,
    @EntryName NVARCHAR(255) = NULL,
    @WebsiteUrl NVARCHAR(255) = NULL,
    @Offset INT = NULL,
    @Limit INT = NULL
AS
BEGIN
    SELECT Id, EntryName, WebsiteUrl, EntryUserName, EncryptedPassword, IV, Notes, IsLiked, CreatedAt, UpdatedAt
    FROM PasswordSchema.PasswordEntry
    WHERE UserId = @UserId
        AND (@EntryName IS NULL OR EntryName LIKE '%' + @EntryName + '%')
        AND (@WebsiteUrl IS NULL OR WebsiteUrl LIKE '%' + @WebsiteUrl + '%')
    ORDER BY EntryName
    OFFSET ISNULL(@Offset, 0) ROWS
    FETCH NEXT ISNULL(@Limit, 10) ROWS ONLY;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_PasswordEntry_SELECT_ById
    @UserId UNIQUEIDENTIFIER,
    @EntryId UNIQUEIDENTIFIER
AS
BEGIN
    SELECT Id, EntryName, WebsiteUrl, EntryUserName, EncryptedPassword, IV, Notes, IsLiked, UserId, CreatedAt, UpdatedAt
    FROM PasswordSchema.PasswordEntry
    WHERE UserId = @UserId AND Id = @EntryId;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_PasswordEntry_INSERT
    @UserId UNIQUEIDENTIFIER,
    @EntryName NVARCHAR(100) ,
    @WebsiteUrl NVARCHAR(255) ,
    @EntryUserName NVARCHAR(100) ,
    @EncryptedPassword VARBINARY(MAX) ,
    @IV NVARCHAR(255) ,
    @Notes NVARCHAR(1000)
AS
BEGIN
    INSERT INTO PasswordSchema.PasswordEntry
        (UserId, EntryName, WebsiteUrl, EntryUserName, EncryptedPassword, IV, Notes)
    OUTPUT
    INSERTED.Id,
    INSERTED.EntryName,
    INSERTED.WebsiteUrl,
    INSERTED.EntryUserName,
    INSERTED.EncryptedPassword,
    INSERTED.IV,
    INSERTED.Notes,
    INSERTED.IsLiked
    VALUES
        (@UserId, @EntryName, @WebsiteUrl, @EntryUserName, @EncryptedPassword, @IV, @Notes);

END

GO
CREATE OR ALTER PROCEDURE PasswordSchema.sp_PasswordEntry_UPDATE
    @UserId UNIQUEIDENTIFIER,
    @EntryId UNIQUEIDENTIFIER,
    @EntryName NVARCHAR(100) ,
    @WebsiteUrl NVARCHAR(255) ,
    @EntryUserName NVARCHAR(100) ,
    @EncryptedPassword VARBINARY(MAX) = NULL,
    @IV NVARCHAR(255) = NULL,
    @Notes NVARCHAR(1000),
    @IsLiked BIT = NULL
AS
BEGIN
    UPDATE PasswordSchema.PasswordEntry 
        SET 
          EntryName = CASE WHEN @EntryName IS NOT NULL THEN @EntryName ELSE EntryName END,
          WebsiteUrl = CASE WHEN @WebsiteUrl IS NOT NULL THEN @WebsiteUrl ELSE WebsiteUrl END,
          EntryUserName = CASE WHEN @EntryUserName IS NOT NULL THEN @EntryUserName ELSE EntryUserName END,
          EncryptedPassword = CASE WHEN @EncryptedPassword IS NOT NULL THEN @EncryptedPassword ELSE EncryptedPassword END,
          IV = CASE WHEN @IV IS NOT NULL THEN @IV ELSE IV END,
          Notes = CASE WHEN @Notes IS NOT NULL THEN @Notes ELSE Notes END,
            IsLiked = CASE WHEN @IsLiked IS NOT NULL THEN @IsLiked ELSE IsLiked END,
          UpdatedAt = GETDATE()
    OUTPUT INSERTED.Id, INSERTED.EntryName, INSERTED.WebsiteUrl, INSERTED.EntryUserName, INSERTED.EncryptedPassword, INSERTED.IV, INSERTED.Notes
    WHERE UserId = @UserId AND Id = @EntryId;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_PasswordEntry_DELETE
    @UserId UNIQUEIDENTIFIER,
    @EntryId UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM PasswordSchema.PasswordEntry
    WHERE UserId = @UserId AND Id = @EntryId;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_PasswordEntry_UPDATE_AfterRecovery
    @UserId UNIQUEIDENTIFIER,
    @Entries PasswordSchema.PasswordEntryUpdateAfterRecoveryTable READONLY
AS
BEGIN
    UPDATE pe
    SET 
        pe.EncryptedPassword = e.EncryptedPassword,
        pe.IV = e.IV,
        pe.UpdatedAt = GETDATE()
    FROM PasswordSchema.PasswordEntry pe
        INNER JOIN @Entries e ON pe.Id = e.Id
    WHERE pe.UserId = @UserId;

    SELECT pe.Id, pe.EntryName, pe.WebsiteUrl, pe.EntryUserName, pe.EncryptedPassword, pe.IV, pe.Notes
    FROM PasswordSchema.PasswordEntry pe
        INNER JOIN @Entries e ON pe.Id = e.Id
    WHERE pe.UserId = @UserId;
END

GO

CREATE OR ALTER PROCEDURE PasswordSchema.sp_PasswordEntry_UPDATE_Like
    @UserId UNIQUEIDENTIFIER,
    @EntryId UNIQUEIDENTIFIER
AS
BEGIN
    UPDATE PasswordSchema.PasswordEntry
    SET IsLiked = CASE WHEN IsLiked = 1 THEN 0 ELSE 1 END
    OUTPUT INSERTED.IsLiked
    WHERE UserId = @UserId AND Id = @EntryId;
END   
    