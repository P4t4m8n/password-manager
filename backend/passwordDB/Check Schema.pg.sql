-- ============================================================================
-- PostgreSQL Check Schema (migrated from SQL Server Check Schema.sql)
--
-- Verifies that the schema, tables, indexes, and functions exist.
-- Run this after Create.pg.sql + all procedure files to validate the setup.
--
-- PG equivalents:
--   sys.schemas    -> information_schema.schemata
--   sys.tables     -> information_schema.tables
--   sys.indexes    -> pg_indexes
--   sys.types      -> N/A (TVP replaced by JSONB, no type to check)
--   sys.procedures -> information_schema.routines (functions in PG)
-- ============================================================================

SELECT 'Schema' AS object_type,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.schemata WHERE schema_name = 'password_schema'
       ) THEN 'OK' ELSE 'MISSING' END AS status,
       'password_schema' AS name

UNION ALL

-- Check Tables
SELECT 'Table',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'password_schema' AND table_name = 'user'
       ) THEN 'OK' ELSE 'MISSING' END,
       'password_schema.user'

UNION ALL

SELECT 'Table',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'password_schema' AND table_name = 'user_settings'
       ) THEN 'OK' ELSE 'MISSING' END,
       'password_schema.user_settings'

UNION ALL

SELECT 'Table',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'password_schema' AND table_name = 'password_entry'
       ) THEN 'OK' ELSE 'MISSING' END,
       'password_schema.password_entry'

UNION ALL

-- Check Indexes
SELECT 'Index',
       CASE WHEN EXISTS (
           SELECT 1 FROM pg_indexes WHERE indexname = 'uq_user_google_id'
       ) THEN 'OK' ELSE 'MISSING' END,
       'uq_user_google_id'

UNION ALL

SELECT 'Index',
       CASE WHEN EXISTS (
           SELECT 1 FROM pg_indexes WHERE indexname = 'idx_password_entry_user_id'
       ) THEN 'OK' ELSE 'MISSING' END,
       'idx_password_entry_user_id'

UNION ALL

SELECT 'Index',
       CASE WHEN EXISTS (
           SELECT 1 FROM pg_indexes WHERE indexname = 'idx_password_entry_url'
       ) THEN 'OK' ELSE 'MISSING' END,
       'idx_password_entry_url'

UNION ALL

-- Check Functions (PG uses functions instead of stored procedures)
SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_for_hash'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_for_hash'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_user_get_one'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_user_get_one'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_for_existing'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_for_existing'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_user_create'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_user_create'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_user_select_master_password_recovery_data'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_user_select_master_password_recovery_data'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_user_update_master_password_recovery'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_user_update_master_password_recovery'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_user_settings_select_by_user_id'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_user_settings_select_by_user_id'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_user_settings_update'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_user_settings_update'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_password_entry_select_many'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_password_entry_select_many'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_password_entry_select_by_id'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_password_entry_select_by_id'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_password_entry_insert'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_password_entry_insert'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_password_entry_update'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_password_entry_update'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_password_entry_delete'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_password_entry_delete'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_password_entry_update_after_recovery'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_password_entry_update_after_recovery'

UNION ALL

SELECT 'Function',
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines
           WHERE routine_schema = 'password_schema' AND routine_name = 'sp_password_entry_like'
       ) THEN 'OK' ELSE 'MISSING' END,
       'sp_password_entry_like'

ORDER BY object_type, name;
