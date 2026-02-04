-- Leaderboard Database Schema for PostgreSQL
-- Run this to set up the database

CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) NOT NULL,
    world_id INT NOT NULL DEFAULT 1,
    map_id INT NOT NULL DEFAULT 1,
    is_infinite BOOLEAN NOT NULL DEFAULT FALSE,
    wave INT NOT NULL,
    kills INT NOT NULL DEFAULT 0,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_scores_world_map_score ON scores(world_id, map_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_infinite ON scores(is_infinite, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_username ON scores(username);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);

-- Optional: Add a unique constraint to prevent duplicate submissions
-- (same user, same map, same wave - keep highest score)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_map ON scores(username, map_id, wave);
