-- Initialize database with pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- This script runs after the database is created by the PostgreSQL image
-- The environment variables are automatically used by the PostgreSQL container
-- POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB are set from the env_file
