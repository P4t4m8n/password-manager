-- ============================================================================
-- PostgreSQL equivalent of Create.sql (migrated from SQL Server)
-- 
-- Key type mappings applied:
--   UNIQUEIDENTIFIER  -> UUID
--   VARBINARY(MAX)    -> BYTEA
--   NVARCHAR(n)       -> VARCHAR(n)
--   DATETIME2         -> TIMESTAMPTZ
--   BIT               -> BOOLEAN
--   NEWID()           -> gen_random_uuid()
--   GETDATE()         -> NOW()
-- 
-- Note: PostgreSQL doesn't support IF NOT EXISTS for schemas via plain SQL,
-- but CREATE SCHEMA IF NOT EXISTS works fine. Table creation uses IF NOT EXISTS.
-- ============================================================================

-- Create the database (run separately or via Docker entrypoint):
-- CREATE DATABASE SecuraDB;

-- Enable the pgcrypto extension for gen_random_uuid() (PG < 13 needs this)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Schema
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS password_schema;

-- ============================================================================
-- Tables
-- ============================================================================

-- Migrated from: PasswordSchema.[User]
-- Renamed schema to password_schema (snake_case convention for PG)
CREATE TABLE IF NOT EXISTS password_schema."user" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Master key recovery fields (binary data)
    encrypted_master_key_with_recovery BYTEA,
    recovery_iv BYTEA,

    master_password_salt BYTEA,

    -- Master password verification token (set during master password setup)
    master_password_verification BYTEA,
    master_password_verification_iv BYTEA,

    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,

    password_hash BYTEA,
    password_salt BYTEA,

    -- Nullable: only set for Google OAuth users
    google_id VARCHAR(100) NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrated from: PasswordSchema.UserSettings
CREATE TABLE IF NOT EXISTS password_schema.user_settings (
    user_id UUID PRIMARY KEY,

    master_password_ttl_in_minutes INT DEFAULT 30,
    auto_lock_time_in_minutes INT DEFAULT 5,

    theme VARCHAR(20) DEFAULT 'system',
    -- PG CHECK constraints work the same as SQL Server
    CONSTRAINT chk_theme CHECK (theme IN ('light', 'dark', 'system')),

    minimum_password_strength VARCHAR(20) DEFAULT 'veryStrong',
    CONSTRAINT chk_min_password_strength CHECK (minimum_password_strength IN ('weak', 'medium', 'strong', 'veryStrong')),

    master_password_storage_mode VARCHAR(20) DEFAULT 'none',
    CONSTRAINT chk_master_password_storage_mode CHECK (master_password_storage_mode IN ('none', 'session', 'local')),

    -- ON DELETE CASCADE works the same
    FOREIGN KEY (user_id) REFERENCES password_schema."user"(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrated from: PasswordSchema.PasswordEntry
CREATE TABLE IF NOT EXISTS password_schema.password_entry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,

    entry_name VARCHAR(100),
    website_url VARCHAR(255),
    entry_user_name VARCHAR(100),
    notes VARCHAR(1000),
    is_liked BOOLEAN DEFAULT FALSE,

    encrypted_password BYTEA NOT NULL,
    iv VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES password_schema."user"(id) ON DELETE CASCADE
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Migrated from: UQ_User_GoogleId (unique filtered/partial index)
-- PG supports partial indexes natively with WHERE clause
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_google_id
    ON password_schema."user"(google_id)
    WHERE google_id IS NOT NULL;

-- Migrated from: IDX_PasswordEntry_UserId
CREATE INDEX IF NOT EXISTS idx_password_entry_user_id
    ON password_schema.password_entry(user_id);

-- Migrated from: IDX_PasswordEntry_Url
CREATE INDEX IF NOT EXISTS idx_password_entry_url
    ON password_schema.password_entry(website_url);

-- ============================================================================
-- Note: SQL Server's Table-Valued Parameter type 
-- (PasswordEntryUpdateAfterRecoveryTable) has no direct PG equivalent.
-- The recovery update function uses JSONB input instead. See the procedures file.
-- ============================================================================
