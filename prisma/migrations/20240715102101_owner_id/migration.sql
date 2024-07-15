alter table may.users
    drop constraint users_owner_id_key;
CREATE UNIQUE INDEX users_owner_id_key ON may.users(owner_id) WHERE deleted_at = 0;