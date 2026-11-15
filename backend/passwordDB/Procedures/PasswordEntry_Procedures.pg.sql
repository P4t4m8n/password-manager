-- ============================================================================
-- PostgreSQL Password Entry Procedures 
-- (migrated from SQL Server PasswordEntry_Procedures.sql)
--
-- All converted to FUNCTIONS (they return result sets).
--
-- Dapper call pattern changes:
--   SQL Server:  "EXEC PasswordSchema.spPasswordEntry_Select_Many @UserId=@UserId, ..."
--   PostgreSQL:  "SELECT * FROM password_schema.sp_password_entry_select_many(@UserId, ...)"
--
-- Notable migration changes:
--   - OUTPUT INSERTED -> INSERT/UPDATE ... RETURNING
--   - ISNULL() -> COALESCE()
--   - OFFSET/FETCH NEXT -> LIMIT/OFFSET (PG native syntax)
--   - Table-Valued Parameter -> JSONB array for bulk recovery update
--   - BIT -> BOOLEAN, VARBINARY -> BYTEA
-- ============================================================================

-- ============================================================================
-- sp_password_entry_select_many: Paginated search with optional filters
-- Migrated from: PasswordSchema.spPasswordEntry_Select_Many
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_password_entry_select_many(
    p_user_id UUID,
    p_entry_name VARCHAR(255) DEFAULT NULL,
    p_website_url VARCHAR(255) DEFAULT NULL,
    p_offset INT DEFAULT NULL,
    p_limit INT DEFAULT NULL
)
RETURNS TABLE (
    "Id" UUID,
    "EntryName" VARCHAR,
    "WebsiteUrl" VARCHAR,
    "EntryUserName" VARCHAR,
    "EncryptedPassword" BYTEA,
    "IV" VARCHAR,
    "Notes" VARCHAR,
    "IsLiked" BOOLEAN,
    "CreatedAt" TIMESTAMPTZ,
    "UpdatedAt" TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT pe.id,
           pe.entry_name,
           pe.website_url,
           pe.entry_user_name,
           pe.encrypted_password,
           pe.iv,
           pe.notes,
           pe.is_liked,
           pe.created_at,
           pe.updated_at
    FROM password_schema.password_entry pe
    WHERE pe.user_id = p_user_id
      -- LIKE filters: PG uses ILIKE for case-insensitive, or LIKE for case-sensitive
      -- Keeping LIKE to match original SQL Server behavior (case depends on collation)
      AND (p_entry_name IS NULL OR pe.entry_name LIKE '%' || p_entry_name || '%')
      AND (p_website_url IS NULL OR pe.website_url LIKE '%' || p_website_url || '%')
    ORDER BY pe.entry_name
    LIMIT COALESCE(p_limit, 10)
    OFFSET COALESCE(p_offset, 0);
END;
$$;

-- ============================================================================
-- sp_password_entry_select_by_id: Get a single entry by user + entry ID
-- Migrated from: PasswordSchema.spPasswordEntry_Select_ById
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_password_entry_select_by_id(
    p_user_id UUID,
    p_entry_id UUID
)
RETURNS TABLE (
    "Id" UUID,
    "EntryName" VARCHAR,
    "WebsiteUrl" VARCHAR,
    "EntryUserName" VARCHAR,
    "EncryptedPassword" BYTEA,
    "IV" VARCHAR,
    "Notes" VARCHAR,
    "IsLiked" BOOLEAN,
    "UserId" UUID,
    "CreatedAt" TIMESTAMPTZ,
    "UpdatedAt" TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT pe.id,
           pe.entry_name,
           pe.website_url,
           pe.entry_user_name,
           pe.encrypted_password,
           pe.iv,
           pe.notes,
           pe.is_liked,
           pe.user_id,
           pe.created_at,
           pe.updated_at
    FROM password_schema.password_entry pe
    WHERE pe.user_id = p_user_id AND pe.id = p_entry_id;
END;
$$;

-- ============================================================================
-- sp_password_entry_insert: Create a new password entry
-- Migrated from: PasswordSchema.spPasswordEntry_Insert
-- Uses INSERT...RETURNING instead of OUTPUT INSERTED
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_password_entry_insert(
    p_user_id UUID,
    p_entry_name VARCHAR(100),
    p_website_url VARCHAR(255),
    p_entry_user_name VARCHAR(100),
    p_encrypted_password BYTEA,
    p_iv VARCHAR(255),
    p_notes VARCHAR(1000)
)
RETURNS TABLE (
    "Id" UUID,
    "EntryName" VARCHAR,
    "WebsiteUrl" VARCHAR,
    "EntryUserName" VARCHAR,
    "EncryptedPassword" BYTEA,
    "IV" VARCHAR,
    "Notes" VARCHAR,
    "IsLiked" BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO password_schema.password_entry
        (user_id, entry_name, website_url, entry_user_name, encrypted_password, iv, notes)
    VALUES
        (p_user_id, p_entry_name, p_website_url, p_entry_user_name, p_encrypted_password, p_iv, p_notes)
    RETURNING
        password_entry.id AS "Id",
        password_entry.entry_name AS "EntryName",
        password_entry.website_url AS "WebsiteUrl",
        password_entry.entry_user_name AS "EntryUserName",
        password_entry.encrypted_password AS "EncryptedPassword",
        password_entry.iv AS "IV",
        password_entry.notes AS "Notes",
        password_entry.is_liked AS "IsLiked";
END;
$$;

-- ============================================================================
-- sp_password_entry_update: Partial update of a password entry
-- Migrated from: PasswordSchema.spPasswordEntry_Update
-- Uses UPDATE...RETURNING instead of OUTPUT INSERTED
-- COALESCE replaces CASE WHEN @Param IS NOT NULL for the same null-skip logic
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_password_entry_update(
    p_user_id UUID,
    p_entry_id UUID,
    p_entry_name VARCHAR(100) DEFAULT NULL,
    p_website_url VARCHAR(255) DEFAULT NULL,
    p_entry_user_name VARCHAR(100) DEFAULT NULL,
    p_encrypted_password BYTEA DEFAULT NULL,
    p_iv VARCHAR(255) DEFAULT NULL,
    p_notes VARCHAR(1000) DEFAULT NULL,
    p_is_liked BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    "Id" UUID,
    "EntryName" VARCHAR,
    "WebsiteUrl" VARCHAR,
    "EntryUserName" VARCHAR,
    "EncryptedPassword" BYTEA,
    "IV" VARCHAR,
    "Notes" VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE password_schema.password_entry pe
    SET
        entry_name       = COALESCE(p_entry_name, pe.entry_name),
        website_url      = COALESCE(p_website_url, pe.website_url),
        entry_user_name  = COALESCE(p_entry_user_name, pe.entry_user_name),
        encrypted_password = COALESCE(p_encrypted_password, pe.encrypted_password),
        iv               = COALESCE(p_iv, pe.iv),
        notes            = COALESCE(p_notes, pe.notes),
        is_liked         = COALESCE(p_is_liked, pe.is_liked),
        updated_at       = NOW()
    WHERE pe.user_id = p_user_id AND pe.id = p_entry_id
    RETURNING
        pe.id AS "Id",
        pe.entry_name AS "EntryName",
        pe.website_url AS "WebsiteUrl",
        pe.entry_user_name AS "EntryUserName",
        pe.encrypted_password AS "EncryptedPassword",
        pe.iv AS "IV",
        pe.notes AS "Notes";
END;
$$;

-- ============================================================================
-- sp_password_entry_delete: Delete a password entry
-- Migrated from: PasswordSchema.spPasswordEntry_DELETE
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_password_entry_delete(
    p_user_id UUID,
    p_entry_id UUID
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    rows_affected INT;
BEGIN
    DELETE FROM password_schema.password_entry
    WHERE user_id = p_user_id AND id = p_entry_id;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$;

-- ============================================================================
-- sp_password_entry_update_after_recovery: Bulk update entries after master 
-- password recovery. 
--
-- Migrated from: PasswordSchema.spPasswordEntry_Update_AfterRecovery
--
-- SQL Server used a Table-Valued Parameter (TVP). PG doesn't support TVPs,
-- so this function accepts a JSONB array instead.
--
-- Expected JSONB format: 
--   [{"Id": "uuid-here", "EncryptedPassword": "base64-bytes", "IV": "string"}, ...]
--
-- The C# side will serialize the list to JSON instead of using a DataTable.
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_password_entry_update_after_recovery(
    p_user_id UUID,
    p_entries JSONB
)
RETURNS TABLE (
    "Id" UUID,
    "EntryName" VARCHAR,
    "WebsiteUrl" VARCHAR,
    "EntryUserName" VARCHAR,
    "EncryptedPassword" BYTEA,
    "IV" VARCHAR,
    "Notes" VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update each entry from the JSONB array
    UPDATE password_schema.password_entry pe
    SET
        encrypted_password = decode(e->>'EncryptedPassword', 'base64'),
        iv = e->>'IV',
        updated_at = NOW()
    FROM jsonb_array_elements(p_entries) AS e
    WHERE pe.id = (e->>'Id')::UUID
      AND pe.user_id = p_user_id;

    -- Return the updated entries
    RETURN QUERY
    SELECT pe.id, pe.entry_name, pe.website_url, pe.entry_user_name,
           pe.encrypted_password, pe.iv, pe.notes
    FROM password_schema.password_entry pe
    INNER JOIN jsonb_array_elements(p_entries) AS e ON pe.id = (e->>'Id')::UUID
    WHERE pe.user_id = p_user_id;
END;
$$;

-- ============================================================================
-- sp_password_entry_like: Toggle the is_liked flag
-- Migrated from: PasswordSchema.spPasswordEntry_Like
-- PG uses NOT to toggle booleans instead of CASE WHEN BIT = 1
-- ============================================================================
CREATE OR REPLACE FUNCTION password_schema.sp_password_entry_like(
    p_user_id UUID,
    p_entry_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    new_value BOOLEAN;
BEGIN
    UPDATE password_schema.password_entry
    SET is_liked = NOT is_liked
    WHERE user_id = p_user_id AND id = p_entry_id
    RETURNING is_liked INTO new_value;

    RETURN new_value;
END;
$$;
