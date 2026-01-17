
USE PasswordDB;
GO
-- Check Schema
SELECT 'Schema' AS ObjectType, 
       CASE WHEN EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'PasswordSchema') 
            THEN 'OK' ELSE 'MISSING' END AS Status,
       'PasswordSchema' AS Name

UNION ALL

-- Check Tables
SELECT 'Table', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND t.name = 'User') 
            THEN 'OK' ELSE 'MISSING' END,
       'PasswordSchema.User'

UNION ALL

SELECT 'Table', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND t.name = 'UserMasterPassword') 
            THEN 'OK' ELSE 'MISSING' END,
       'PasswordSchema.UserMasterPassword'

UNION ALL

SELECT 'Table', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND t.name = 'UserSettings') 
            THEN 'OK' ELSE 'MISSING' END,
       'PasswordSchema.UserSettings'

UNION ALL

SELECT 'Table', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND t.name = 'PasswordEntry') 
            THEN 'OK' ELSE 'MISSING' END,
       'PasswordSchema.PasswordEntry'

UNION ALL

-- Check Indexes
SELECT 'Index', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_User_GoogleId') 
            THEN 'OK' ELSE 'MISSING' END,
       'UQ_User_GoogleId'

UNION ALL

SELECT 'Index', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_PasswordEntry_UserId') 
            THEN 'OK' ELSE 'MISSING' END,
       'IDX_PasswordEntry_UserId'

UNION ALL

SELECT 'Index', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IDX_PasswordEntry_Url') 
            THEN 'OK' ELSE 'MISSING' END,
       'IDX_PasswordEntry_Url'

UNION ALL

-- Check Constraints
SELECT 'Constraint',
       CASE WHEN EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'chk_theme') THEN 'OK' ELSE 'MISSING' END,
       'chk_theme'

UNION ALL

SELECT 'Constraint',
       CASE WHEN EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'chk_min_password_strength') THEN 'OK' ELSE 'MISSING' END,
       'chk_min_password_strength'

UNION ALL

SELECT 'Constraint',
       CASE WHEN EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'chk_master_password_storage_mode') THEN 'OK' ELSE 'MISSING' END,
       'chk_master_password_storage_mode'

UNION ALL

-- Check User Type
SELECT 'Type', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.types WHERE name = 'PasswordEntryUpdateAfterRecoveryTable' AND is_table_type = 1) 
            THEN 'OK' ELSE 'MISSING' END,
       'PasswordEntryUpdateAfterRecoveryTable'

UNION ALL

-- Check Stored Procedures
SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_User_SELECT_ForHash') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_User_SELECT_ForHash'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_User_SELECT_ByIdOrEmail') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_User_SELECT_ByIdOrEmail'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_User_SELECT_ForExisting') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_User_SELECT_ForExisting'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_User_INSERT_CreateNewUser') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_User_INSERT_CreateNewUser'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_UserMasterPassword_SELECT_MasterPasswordRecoveryData') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_UserMasterPassword_SELECT_MasterPasswordRecoveryData'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_UserMasterPassword_SELECT_MasterPasswordTestData') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_UserMasterPassword_SELECT_MasterPasswordTestData'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_UserMasterPassword_INSERT') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_UserMasterPassword_INSERT'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_UserMasterPassword_UPDATE') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_UserMasterPassword_UPDATE'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_UserSettings_SELECT_ByUserId') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_UserSettings_SELECT_ByUserId'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_UserSettings_UPDATE') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_UserSettings_UPDATE'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_PasswordEntry_SELECT_Many') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_PasswordEntry_SELECT_Many'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_PasswordEntry_SELECT_ById') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_PasswordEntry_SELECT_ById'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_PasswordEntry_INSERT') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_PasswordEntry_INSERT'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_PasswordEntry_UPDATE') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_PasswordEntry_UPDATE'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_PasswordEntry_DELETE') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_PasswordEntry_DELETE'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_PasswordEntry_UPDATE_AfterRecovery') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_PasswordEntry_UPDATE_AfterRecovery'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'sp_PasswordEntry_UPDATE_Like') 
            THEN 'OK' ELSE 'MISSING' END,
       'sp_PasswordEntry_UPDATE_Like'

ORDER BY ObjectType, Name;