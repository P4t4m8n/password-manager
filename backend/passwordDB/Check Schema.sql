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

-- Check User Type
SELECT 'Type', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.types WHERE name = 'PasswordEntryUpdateAfterRecoveryTable' AND is_table_type = 1) 
            THEN 'OK' ELSE 'MISSING' END,
       'PasswordEntryUpdateAfterRecoveryTable'

UNION ALL

-- Check Stored Procedures
SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spFor_Hash') 
            THEN 'OK' ELSE 'MISSING' END,
       'spFor_Hash'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spUser_GetOne') 
            THEN 'OK' ELSE 'MISSING' END,
       'spUser_GetOne'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spFor_Existing') 
            THEN 'OK' ELSE 'MISSING' END,
       'spFor_Existing'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spUser_Create') 
            THEN 'OK' ELSE 'MISSING' END,
       'spUser_Create'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spUser_Select_MasterPasswordRecoveryData') 
            THEN 'OK' ELSE 'MISSING' END,
       'spUser_Select_MasterPasswordRecoveryData'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spUser_Update_MasterPasswordRecovery') 
            THEN 'OK' ELSE 'MISSING' END,
       'spUser_Update_MasterPasswordRecovery'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spUserSettings_Select_ByUserId') 
            THEN 'OK' ELSE 'MISSING' END,
       'spUserSettings_Select_ByUserId'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spUserSettings_Update') 
            THEN 'OK' ELSE 'MISSING' END,
       'spUserSettings_Update'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spPasswordEntry_Select_Many') 
            THEN 'OK' ELSE 'MISSING' END,
       'spPasswordEntry_Select_Many'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spPasswordEntry_Select_ById') 
            THEN 'OK' ELSE 'MISSING' END,
       'spPasswordEntry_Select_ById'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spPasswordEntry_Insert') 
            THEN 'OK' ELSE 'MISSING' END,
       'spPasswordEntry_Insert'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spPasswordEntry_Update') 
            THEN 'OK' ELSE 'MISSING' END,
       'spPasswordEntry_Update'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spPasswordEntry_DELETE') 
            THEN 'OK' ELSE 'MISSING' END,
       'spPasswordEntry_DELETE'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spPasswordEntry_Update_AfterRecovery') 
            THEN 'OK' ELSE 'MISSING' END,
       'spPasswordEntry_Update_AfterRecovery'

UNION ALL

SELECT 'Procedure', 
       CASE WHEN EXISTS (SELECT 1 FROM sys.procedures p JOIN sys.schemas s ON p.schema_id = s.schema_id 
                         WHERE s.name = 'PasswordSchema' AND p.name = 'spPasswordEntry_Like') 
            THEN 'OK' ELSE 'MISSING' END,
       'spPasswordEntry_Like'

ORDER BY ObjectType, Name;