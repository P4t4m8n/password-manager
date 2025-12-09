IF NOT EXISTS (SELECT *
FROM sys.databases
WHERE name = 'PasswordDB')
BEGIN
    CREATE DATABASE PasswordDB;
END
GO

USE PasswordDB;
GO
SET QUOTED_IDENTIFIER ON;
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

        EncryptedMasterKeyWithRecovery VARBINARY (MAX) NOT NULL,
        RecoveryIV VARBINARY (MAX) NOT NULL,

        MasterPasswordSalt VARBINARY (MAX) ,

        Username NVARCHAR (50) NOT NULL UNIQUE,
        Email NVARCHAR (100) NOT NULL UNIQUE,

        PasswordHash VARBINARY (MAX) ,
        PasswordSalt VARBINARY (MAX) ,

        GoogleId NVARCHAR (100) NULL,

        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()

    );

END

IF NOT EXISTS (SELECT *
FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'PasswordSchema' AND t.name = 'UserSettings')
BEGIN
    CREATE TABLE PasswordSchema.UserSettings
    (
        UserId UNIQUEIDENTIFIER PRIMARY KEY,

        MasterPasswordTTLInMinutes INT DEFAULT 30,
        AutoLockTimeInMinutes INT DEFAULT 5,

        Theme NVARCHAR(20) DEFAULT 'system',
        CONSTRAINT chk_theme CHECK (Theme IN ('light', 'dark', 'system')),

        MinimumPasswordStrength NVARCHAR(20) DEFAULT 'very-strong',
        CONSTRAINT chk_min_password_strength CHECK (MinimumPasswordStrength IN ('weak', 'medium', 'strong', 'very-strong')),

        MasterPasswordStorageMode NVARCHAR(20) DEFAULT 'none',
        CONSTRAINT chk_master_password_storage_mode CHECK (MasterPasswordStorageMode IN ('none', 'session', 'local')),

        FOREIGN KEY (UserId) REFERENCES PasswordSchema.[User](Id) ON DELETE CASCADE,

        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()

    );

END

GO

IF NOT EXISTS (SELECT *
FROM sys.indexes
WHERE name = 'UQ_User_GoogleId' AND object_id = OBJECT_ID('PasswordSchema.[User]'))
BEGIN
    CREATE UNIQUE INDEX UQ_User_GoogleId 
    ON PasswordSchema.[User](GoogleId) 
    WHERE GoogleId IS NOT NULL;
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
        Notes NVARCHAR(1000),

        EncryptedPassword VARBINARY(MAX) NOT NULL,
        IV NVARCHAR(255) NOT NULL,

        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),

        FOREIGN KEY (UserId) REFERENCES PasswordSchema.[User](Id) ON DELETE CASCADE
    );
END

GO

IF NOT EXISTS (SELECT *
FROM sys.types
WHERE name = 'PasswordEntryUpdateAfterRecoveryTable' AND is_table_type = 1)
BEGIN
    CREATE TYPE PasswordSchema.PasswordEntryUpdateAfterRecoveryTable AS TABLE
(
        Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        EncryptedPassword VARBINARY(MAX) NOT NULL,
        IV NVARCHAR(255) NOT NULL
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