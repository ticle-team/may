-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "shaple_builder";
CREATE SCHEMA IF NOT EXISTS "may";

-- CreateTable
CREATE TABLE "may"."users" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" BIGINT NOT NULL DEFAULT 0,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "may"."threads" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" BIGINT NOT NULL DEFAULT 0,
    "author_id" INTEGER NOT NULL,
    "openai_thread_id" TEXT NOT NULL,
    "shaple_stack_id" BIGINT,
    "shaple_project_id" BIGINT NOT NULL,

    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "shaple_builder"."stacks" (
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "stacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS  "shaple_builder"."projects" (
    "id" BIGSERIAL NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS  "shaple_builder"."users" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" BIGINT NOT NULL DEFAULT 0,
    "git_private_key_pem" BYTEA NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_owner_id_key" ON "may"."users"("owner_id") WHERE deleted_at = 0;

-- CreateIndex
CREATE UNIQUE INDEX "threads_shaple_stack_id_key" ON "may"."threads"("shaple_stack_id") WHERE deleted_at = 0;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_owner_id_key" ON "shaple_builder"."users"("owner_id") WHERE deleted_at = 0;;

-- AddForeignKey
ALTER TABLE "may"."threads" ADD CONSTRAINT "threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "may"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "may"."threads" ADD CONSTRAINT "threads_shaple_stack_id_fkey" FOREIGN KEY ("shaple_stack_id") REFERENCES "shaple_builder"."stacks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "may"."threads" ADD CONSTRAINT "threads_shaple_project_id_fkey" FOREIGN KEY ("shaple_project_id") REFERENCES "shaple_builder"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
