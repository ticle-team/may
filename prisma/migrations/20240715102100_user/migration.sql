ALTER TABLE may.users DROP COLUMN nickname;

ALTER TABLE may.users ADD COLUMN shaple_user_id INT REFERENCES shaple_builder.users(id);
CREATE UNIQUE INDEX IF NOT EXISTS "users_shaple_user_id_key" ON "may"."users"("shaple_user_id") WHERE deleted_at = 0 AND shaple_user_id IS NOT NULL;
