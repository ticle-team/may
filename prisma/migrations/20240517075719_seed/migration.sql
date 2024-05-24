-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "shaple_builder";
CREATE SCHEMA IF NOT EXISTS "may";

-- CreateTable users
CREATE TABLE "may"."users" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" BIGINT NOT NULL DEFAULT 0,
    "owner_id" TEXT NOT NULL UNIQUE,
    "nickname" TEXT,
    "description" TEXT
);

-- CreateTable organizations
CREATE TABLE "may"."organizations" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" BIGINT NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL UNIQUE,
    "owner_id" INT NOT NULL,
    CONSTRAINT fk_owner FOREIGN KEY ("owner_id") REFERENCES "may"."users"("id")
);

-- CreateTable memberships
CREATE TABLE "may"."memberships" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "organization_id" INT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY ("user_id") REFERENCES "may"."users"("id"),
    CONSTRAINT fk_organization FOREIGN KEY ("organization_id") REFERENCES "may"."organizations"("id"),
    UNIQUE ("user_id", "organization_id")
);

-- CreateTable
CREATE TABLE "may"."threads" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" BIGINT NOT NULL DEFAULT 0,
    "author_id" INTEGER NOT NULL,
    "openai_thread_id" TEXT NOT NULL,
    "shaple_stack_id" BIGINT
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_owner_id_key" ON "may"."users"("owner_id") WHERE deleted_at = 0;
CREATE UNIQUE INDEX IF NOT EXISTS "threads_shaple_stack_id_key" ON "may"."threads"("shaple_stack_id") WHERE deleted_at = 0;

ALTER TABLE "may"."threads" ADD CONSTRAINT "threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "may"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "may"."threads" ADD CONSTRAINT "threads_shaple_stack_id_fkey" FOREIGN KEY ("shaple_stack_id") REFERENCES "shaple_builder"."stacks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
