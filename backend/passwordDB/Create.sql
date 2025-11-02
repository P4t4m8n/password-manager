IF NOT EXISTS (SELECT *
FROM sys.databases
WHERE name = 'PasswordDB')
BEGIN
    CREATE DATABASE PasswordDB;
END
GO

USE PasswordDB;

GO

IF NOT EXISTS (SELECT *
FROM sys.schemas
WHERE name = 'PasswordSchema')
    EXEC('CREATE SCHEMA PasswordSchema');

GO

IF NOT EXISTS (SELECT *
FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'PasswordSchema' AND t.name = 'User')
BEGIN

    CREATE TABLE PasswordSchema.[User]
    (
        Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        PasswordHash VARBINARY(MAX) ,
        GoogleId NVARCHAR(100) UNIQUE,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        Salt VARBINARY(MAX) NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()

    );

END

GO
IF NOT EXISTS (SELECT *
FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'PasswordSchema' AND t.name = 'PasswordEntry')
BEGIN

    CREATE TABLE PasswordSchema.PasswordEntry
    (
        Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        UserId UNIQUEIDENTIFIER NOT NULL,
        EntryName NVARCHAR(100) ,
        WebsiteUrl NVARCHAR(255),
        EntryUserName NVARCHAR(100),
        EncryptedPassword VARBINARY(MAX) NOT NULL,
        IV NVARCHAR(255) NOT NULL,
        Notes NVARCHAR(1000),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES PasswordSchema.[User](Id) ON DELETE CASCADE
    );
END

GO

IF NOT EXISTS (SELECT *
FROM sys.indexes
WHERE name = 'IDX_PasswordEntry_UserId' AND object_id = OBJECT_ID('PasswordSchema.PasswordEntry'))
BEGIN
    CREATE INDEX IDX_PasswordEntry_UserId ON PasswordSchema.PasswordEntry(UserId);
END

GO

IF NOT EXISTS (SELECT *
FROM sys.indexes
WHERE name = 'IDX_PasswordEntry_Url' AND object_id = OBJECT_ID('PasswordSchema.PasswordEntry'))
BEGIN
    CREATE INDEX IDX_PasswordEntry_Url ON PasswordSchema.PasswordEntry(WebsiteUrl);
END