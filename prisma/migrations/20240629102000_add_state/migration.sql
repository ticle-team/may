ALTER TABLE
    may.threads
    ADD COLUMN state VARCHAR(32) NOT NULL DEFAULT 'none';

ALTER TABLE
    may.threads
    ADD COLUMN state_info JSONB;