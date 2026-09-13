-- Roles & permissions (RBAC).
--
-- Hand-edited: Prisma would add "User"."role_id" as NOT NULL straight away,
-- which fails on a non-empty table. Instead the column is added nullable,
-- existing accounts are backfilled with the Worker role (never Admin — an
-- unknown account must not silently gain full access), and only then is the
-- NOT NULL constraint applied. The seed upserts the same role by name and
-- attaches its permissions.

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(100) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "idx_role_permissions_permission" ON "role_permissions"("permission_id");

-- AlterTable: add nullable, backfill, then enforce NOT NULL.
ALTER TABLE "User" ADD COLUMN "role_id" UUID;

INSERT INTO "roles" ("id", "name")
SELECT gen_random_uuid(), 'Worker'
WHERE EXISTS (SELECT 1 FROM "User");

UPDATE "User"
SET "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'Worker')
WHERE "role_id" IS NULL;

ALTER TABLE "User" ALTER COLUMN "role_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "idx_user_role" ON "User"("role_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
