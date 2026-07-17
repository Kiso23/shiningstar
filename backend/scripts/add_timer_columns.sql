-- SQL Migration: Add timer columns to matches table
-- Run this in your PostgreSQL database to add match start/end time tracking

-- Add match_start_time column if it doesn't exist
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_start_time TIMESTAMP NULL;

-- Add match_end_time column if it doesn't exist
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_end_time TIMESTAMP NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_match_start_time ON matches(match_start_time);
CREATE INDEX IF NOT EXISTS idx_matches_match_end_time ON matches(match_end_time);

-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name='matches' 
  AND column_name IN ('match_start_time', 'match_end_time')
ORDER BY ordinal_position;
