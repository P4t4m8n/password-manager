-- ============================================================================
-- PostgreSQL User Procedures (migrated from SQL Server User_Procedures.sql)
--
-- All SQL Server stored procedures are converted to PostgreSQL FUNCTIONS
-- because they return result sets (SELECT). In PG, CALL is for procedures
-- that don't return data; SELECT * FROM func() is for functions that do.
--
-- Dapper call pattern changes:
--   SQL Server:  "EXEC PasswordSchema.spFor_Hash @Email=@Email"
--   PostgreSQL:  "SELECT * FROM password_schema.sp_for_hash(@Email)"
--
-- Column names use snake_case in PG but Dapper maps them to PascalCase C#
-- properties via column aliases (AS "ColumnName").
-- ============================================================================

-- ============================================================================
-- sp_for_hash: Get password hash + salt for email-based login
-- Migrated from: PasswordSchema.spFor_Hash
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_for_hash(
    p_email VARCHAR(100)
)
RETURNS TABLE (
    "PasswordHash" BYTEA,
    "PasswordSalt" BYTEA
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.password_hash AS "PasswordHash",
           u.password_salt AS "PasswordSalt"
    FROM password_schema."user" u
    WHERE u.email = p_email;
END;
$$;

-- ============================================================================
-- sp_user_get_one: Get user + settings by email or ID
-- Migrated from: PasswordSchema.spUser_GetOne
-- Returns a joined row; Dapper splits on MasterPasswordTTLInMinutes
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_user_get_one(
    p_email VARCHAR(100) DEFAULT NULL,
    p_id UUID DEFAULT NULL
)
RETURNS TABLE (
    "Id" UUID,
    "UserName" VARCHAR,
    "Email" VARCHAR,
    "MasterPasswordSalt" BYTEA,
    "MasterPasswordVerification" BYTEA,
    "MasterPasswordVerificationIV" BYTEA,
    "MasterPasswordTTLInMinutes" INT,
    "AutoLockTimeInMinutes" INT,
    "Theme" VARCHAR,
    "MinimumPasswordStrength" VARCHAR,
    "MasterPasswordStorageMode" VARCHAR,
    "UserId" UUID,
    "CreatedAt" TIMESTAMPTZ,
    "UpdatedAt" TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id,
           u.username,
           u.email,
           u.master_password_salt,
           u.master_password_verification,
           u.master_password_verification_iv,
           s.master_password_ttl_in_minutes,
           s.auto_lock_time_in_minutes,
           s.theme,
           s.minimum_password_strength,
           s.master_password_storage_mode,
           s.user_id,
           s.created_at,
           s.updated_at
    FROM password_schema."user" u
    INNER JOIN password_schema.user_settings s ON u.id = s.user_id
    WHERE u.email = p_email OR u.id = p_id;
END;
$$;

-- ============================================================================
-- sp_for_existing: Check if a user with the given email exists
-- Migrated from: PasswordSchema.spFor_Existing
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_for_existing(
    p_email VARCHAR(100)
)
RETURNS TABLE (
    "Email" VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.email
    FROM password_schema."user" u
    WHERE u.email = p_email;
END;
$$;

-- ============================================================================
-- sp_user_create: Create a new user + default settings in a transaction
-- Migrated from: PasswordSchema.spUser_Create
--
-- PG note: Functions run inside an implicit transaction. If anything throws,
-- the entire function call is rolled back. No explicit BEGIN/COMMIT needed.
-- The OUTPUT INSERTED pattern from SQL Server is replaced by INSERT...RETURNING.
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_user_create(
    p_email VARCHAR(100),
    p_username VARCHAR(100),
    p_password_hash BYTEA,
    p_password_salt BYTEA
)
RETURNS TABLE (
    "Id" UUID,
    "Email" VARCHAR,
    "Username" VARCHAR,
    "MasterPasswordSalt" BYTEA,
    "MasterPasswordVerification" BYTEA,
    "MasterPasswordVerificationIV" BYTEA,
    "MasterPasswordTTLInMinutes" INT,
    "AutoLockTimeInMinutes" INT,
    "Theme" VARCHAR,
    "UserId" UUID,
    "MinimumPasswordStrength" VARCHAR,
    "MasterPasswordStorageMode" VARCHAR,
    "CreatedAt" TIMESTAMPTZ,
    "UpdatedAt" TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Insert user and capture the generated ID (no crypto data at sign-up)
    INSERT INTO password_schema."user"
        (email, username, password_hash, password_salt)
    VALUES
        (p_email, p_username, p_password_hash, p_password_salt)
    RETURNING id INTO new_user_id;

    -- Create default settings for the new user
    INSERT INTO password_schema.user_settings (user_id)
    VALUES (new_user_id);

    -- Return the joined user + settings (matches SQL Server output)
    RETURN QUERY
    SELECT u.id,
           u.email,
           u.username,
           u.master_password_salt,
           u.master_password_verification,
           u.master_password_verification_iv,
           s.master_password_ttl_in_minutes,
           s.auto_lock_time_in_minutes,
           s.theme,
           s.user_id,
           s.minimum_password_strength,
           s.master_password_storage_mode,
           s.created_at,
           s.updated_at
    FROM password_schema."user" u
    INNER JOIN password_schema.user_settings s ON u.id = s.user_id
    WHERE u.id = new_user_id;
END;
$$;

-- ============================================================================
-- sp_user_select_master_password_recovery_data: Get recovery keys for a user
-- Migrated from: PasswordSchema.spUser_Select_MasterPasswordRecoveryData
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_user_select_master_password_recovery_data(
    p_user_id UUID
)
RETURNS TABLE (
    "EncryptedMasterKeyWithRecovery" BYTEA,
    "RecoveryIV" BYTEA
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.encrypted_master_key_with_recovery,
           u.recovery_iv
    FROM password_schema."user" u
    WHERE u.id = p_user_id;
END;
$$;

-- ============================================================================
-- sp_user_update_master_password_recovery: Update recovery data + return user
-- Migrated from: PasswordSchema.spUser_Update_MasterPasswordRecovery
--
-- PG note: UPDATE...RETURNING replaces the separate UPDATE + SELECT pattern.
-- But we keep the SELECT to match the original output columns exactly.
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_user_update_master_password_recovery(
    p_user_id UUID,
    p_encrypted_master_key_with_recovery BYTEA,
    p_recovery_iv BYTEA,
    p_master_password_salt BYTEA,
    p_master_password_verification BYTEA,
    p_master_password_verification_iv BYTEA
)
RETURNS TABLE (
    "Id" UUID,
    "Email" VARCHAR,
    "Username" VARCHAR,
    "MasterPasswordSalt" BYTEA
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE password_schema."user"
    SET encrypted_master_key_with_recovery = p_encrypted_master_key_with_recovery,
        recovery_iv = p_recovery_iv,
        master_password_salt = p_master_password_salt,
        master_password_verification = p_master_password_verification,
        master_password_verification_iv = p_master_password_verification_iv,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN QUERY
    SELECT u.id, u.email, u.username, u.master_password_salt
    FROM password_schema."user" u
    WHERE u.id = p_user_id;
END;
$$;

-- ============================================================================
-- sp_user_setup_master_password: First-time master password setup after sign-up
-- Sets all crypto columns (salt, recovery key, verification token)
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_user_setup_master_password(
    p_user_id UUID,
    p_master_password_salt BYTEA,
    p_encrypted_master_key_with_recovery BYTEA,
    p_recovery_iv BYTEA,
    p_master_password_verification BYTEA,
    p_master_password_verification_iv BYTEA
)
RETURNS TABLE (
    "Id" UUID,
    "Email" VARCHAR,
    "Username" VARCHAR,
    "MasterPasswordSalt" BYTEA
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only allow setup if master password hasn't been set yet
    IF EXISTS (
        SELECT 1 FROM password_schema."user"
        WHERE id = p_user_id AND master_password_salt IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Master password has already been set up for this user';
    END IF;

    UPDATE password_schema."user"
    SET master_password_salt = p_master_password_salt,
        encrypted_master_key_with_recovery = p_encrypted_master_key_with_recovery,
        recovery_iv = p_recovery_iv,
        master_password_verification = p_master_password_verification,
        master_password_verification_iv = p_master_password_verification_iv,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN QUERY
    SELECT u.id, u.email, u.username, u.master_password_salt
    FROM password_schema."user" u
    WHERE u.id = p_user_id;
END;
$$;
