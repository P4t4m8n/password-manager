-- ============================================================================
-- PostgreSQL User Settings Procedures 
-- (migrated from SQL Server UserSettings_Procedures.sql)
--
-- Dapper call pattern changes:
--   SQL Server:  "EXEC PasswordSchema.spUserSettings_Select_ByUserId @UserId=@UserId"
--   PostgreSQL:  "SELECT * FROM password_schema.sp_user_settings_select_by_user_id(@UserId)"
-- ============================================================================

-- ============================================================================
-- sp_user_settings_select_by_user_id: Get settings for a user
-- Migrated from: PasswordSchema.spUserSettings_Select_ByUserId
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_user_settings_select_by_user_id(
    p_user_id UUID
)
RETURNS TABLE (
    "MasterPasswordTTLInMinutes" INT,
    "AutoLockTimeInMinutes" INT,
    "Theme" VARCHAR,
    "MinimumPasswordStrength" VARCHAR,
    "MasterPasswordStorageMode" VARCHAR,
    "UpdatedAt" TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.master_password_ttl_in_minutes,
           s.auto_lock_time_in_minutes,
           s.theme,
           s.minimum_password_strength,
           s.master_password_storage_mode,
           s.updated_at
    FROM password_schema.user_settings s
    WHERE s.user_id = p_user_id;
END;
$$;

-- ============================================================================
-- sp_user_settings_update: Update user settings (partial update with COALESCE)
-- Migrated from: PasswordSchema.spUserSettings_Update
-- 
-- Note: The original SQL Server proc used GETUTCDATE() while others used 
-- GETDATE(). PostgreSQL NOW() returns UTC if timezone is set to UTC,
-- or local time otherwise. Using NOW() consistently here.
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_user_settings_update(
    p_user_id UUID,
    p_master_password_ttl_in_minutes INT DEFAULT 30,
    p_auto_lock_time_in_minutes INT DEFAULT 5,
    p_theme VARCHAR(20) DEFAULT 'light',
    p_minimum_password_strength VARCHAR(20) DEFAULT 'veryStrong',
    p_master_password_storage_mode VARCHAR(20) DEFAULT 'none'
)
RETURNS TABLE (
    "UserId" UUID,
    "MasterPasswordTTLInMinutes" INT,
    "AutoLockTimeInMinutes" INT,
    "Theme" VARCHAR,
    "MinimumPasswordStrength" VARCHAR,
    "MasterPasswordStorageMode" VARCHAR,
    "CreatedAt" TIMESTAMPTZ,
    "UpdatedAt" TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE password_schema.user_settings s
    SET
        master_password_ttl_in_minutes = COALESCE(p_master_password_ttl_in_minutes, s.master_password_ttl_in_minutes),
        auto_lock_time_in_minutes      = COALESCE(p_auto_lock_time_in_minutes, s.auto_lock_time_in_minutes),
        theme                          = COALESCE(p_theme, s.theme),
        minimum_password_strength      = COALESCE(p_minimum_password_strength, s.minimum_password_strength),
        master_password_storage_mode   = COALESCE(p_master_password_storage_mode, s.master_password_storage_mode),
        updated_at                     = NOW()
    WHERE s.user_id = p_user_id;

    RETURN QUERY
    SELECT s.user_id,
           s.master_password_ttl_in_minutes,
           s.auto_lock_time_in_minutes,
           s.theme,
           s.minimum_password_strength,
           s.master_password_storage_mode,
           s.created_at,
           s.updated_at
    FROM password_schema.user_settings s
    WHERE s.user_id = p_user_id;
END;
$$;
