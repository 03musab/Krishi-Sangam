-- ═══════════════════════════════════════════
-- Migration 002 — Farm detail columns
-- Adds 8 new columns to the users table for
-- the enhanced farmer registration flow.
--
-- Run with:
--   node scripts/migrate-farm-details.js
-- Or directly via psql / Supabase SQL Editor.
-- ═══════════════════════════════════════════

-- Idempotent: each statement only adds a column if it doesn't already exist.

ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_size_unit    TEXT DEFAULT 'Acre';
ALTER TABLE users ADD COLUMN IF NOT EXISTS land_ownership    TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS irrigation_type   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS main_crops        TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS soil_type         TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS farming_experience TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_access       TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_notes        TEXT;
