-- Migration: Add club logos/flags support to matches table
-- Run this SQL directly on your database

-- Add team_a_logo column if it doesn't exist
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS team_a_logo TEXT NULL;

-- Add team_b_logo column if it doesn't exist
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS team_b_logo TEXT NULL;

-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND column_name IN ('team_a_logo', 'team_b_logo')
ORDER BY column_name;
