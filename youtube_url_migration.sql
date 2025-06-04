-- Migration: Add youtube_url column to sessions table
-- This allows YouTube URLs to be persisted with sessions

ALTER TABLE sessions 
ADD COLUMN youtube_url TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN sessions.youtube_url IS 'YouTube URL associated with the session for learning/reference';