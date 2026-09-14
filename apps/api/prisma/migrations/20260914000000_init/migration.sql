-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Clinic" (
    "id_clinic" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100),
    "address" VARCHAR(200),

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id_clinic")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id_supplier" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(200),
    "type" SMALLINT,
    "phone" VARCHAR(20),
    "contact_email" VARCHAR(100),
    "contact_name" VARCHAR(100),
    "province" VARCHAR(100),

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id_supplier")
);

-- CreateTable
CREATE TABLE "Veterinarian" (
    "id_supplier" UUID NOT NULL,
    "id_clinic" UUID NOT NULL,
    "modality" VARCHAR(50),
    "specialty" VARCHAR(100),
    "fax" VARCHAR(20),
    "veterinarian_email" VARCHAR(100),
    "city_distance" DECIMAL(10,2),

    CONSTRAINT "Veterinarian_pkey" PRIMARY KEY ("id_supplier")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id_contract" UUID NOT NULL,
    "id_supplier" UUID NOT NULL,
    "contract_category" SMALLINT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reconciliation_date" DATE,
    "description" VARCHAR(300),
    "status" SMALLINT DEFAULT 1,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id_contract")
);

-- CreateTable
CREATE TABLE "TransportService" (
    "id_contract" UUID NOT NULL,
    "vehicle" VARCHAR(100),
    "transport_modality" VARCHAR(100),

    CONSTRAINT "TransportService_pkey" PRIMARY KEY ("id_contract")
);

-- CreateTable
CREATE TABLE "ServiceOffered" (
    "id_service" UUID NOT NULL,
    "id_contract" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "food_type" VARCHAR(100),
    "base_price" DECIMAL(10,2) NOT NULL,
    "surcharge" DECIMAL(10,2) DEFAULT 0,

    CONSTRAINT "ServiceOffered_pkey" PRIMARY KEY ("id_service")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id_animal" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "species" VARCHAR(50) NOT NULL,
    "breed" VARCHAR(50),
    "birth_date" DATE,
    "weight" DECIMAL(6,2),
    "entry_date" DATE NOT NULL,
    "status" SMALLINT DEFAULT 1,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id_animal")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id_activity" UUID NOT NULL,
    "id_animal" UUID NOT NULL,
    "id_service" UUID NOT NULL,
    "description" VARCHAR(300),
    "date" DATE NOT NULL,
    "time" TIME(6),

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id_activity")
);

-- CreateTable
CREATE TABLE "Adoption" (
    "id_adoption" UUID NOT NULL,
    "id_animal" UUID NOT NULL,
    "adoption_date" DATE NOT NULL,
    "adoption_price" DECIMAL(10,2),

    CONSTRAINT "Adoption_pkey" PRIMARY KEY ("id_adoption")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id_donation" UUID NOT NULL,
    "id_animal" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "donor" VARCHAR(100),

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id_donation")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "idx_supplier_province" ON "Supplier"("province");

-- CreateIndex
CREATE INDEX "idx_supplier_type" ON "Supplier"("type");

-- CreateIndex
CREATE INDEX "idx_contract_category" ON "Contract"("contract_category");

-- CreateIndex
CREATE INDEX "idx_contract_dates" ON "Contract"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_contract_status" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "idx_service_contract" ON "ServiceOffered"("id_contract");

-- CreateIndex
CREATE INDEX "idx_animals_species" ON "Animal"("species");

-- CreateIndex
CREATE INDEX "idx_animals_status" ON "Animal"("status");

-- CreateIndex
CREATE INDEX "idx_animals_created_at" ON "Animal"("entry_date" DESC);

-- CreateIndex
CREATE INDEX "idx_activity_date" ON "Activity"("date");

-- CreateIndex
CREATE INDEX "idx_activity_service" ON "Activity"("id_service");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_role" ON "User"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "idx_role_permissions_permission" ON "role_permissions"("permission_id");

-- AddForeignKey
ALTER TABLE "Veterinarian" ADD CONSTRAINT "Veterinarian_id_supplier_fkey" FOREIGN KEY ("id_supplier") REFERENCES "Supplier"("id_supplier") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Veterinarian" ADD CONSTRAINT "Veterinarian_id_clinic_fkey" FOREIGN KEY ("id_clinic") REFERENCES "Clinic"("id_clinic") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_id_supplier_fkey" FOREIGN KEY ("id_supplier") REFERENCES "Supplier"("id_supplier") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TransportService" ADD CONSTRAINT "TransportService_id_contract_fkey" FOREIGN KEY ("id_contract") REFERENCES "Contract"("id_contract") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServiceOffered" ADD CONSTRAINT "ServiceOffered_id_contract_fkey" FOREIGN KEY ("id_contract") REFERENCES "Contract"("id_contract") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal"("id_animal") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_id_service_fkey" FOREIGN KEY ("id_service") REFERENCES "ServiceOffered"("id_service") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Adoption" ADD CONSTRAINT "Adoption_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal"("id_animal") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal"("id_animal") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- CHECK constraints
--
-- The Prisma schema language cannot express these, so they are added here by
-- hand. Prisma cannot see them either, which means `migrate dev` will never try
-- to drop them. They are also enforced by the Zod schemas in @repo/schemas and,
-- where a PATCH can send only one side of a comparison, re-checked in the
-- service layer against the merged row.
--
-- Enumerations are SMALLINT; the value sets mirror packages/schemas/src/enums.ts.
-- ---------------------------------------------------------------------------

-- SupplierType: 1 Veterinarian, 2 Food Company, 3 Service Company
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_type_check"
  CHECK ("type" IN (1, 2, 3));

-- ContractCategory: 1 Veterinarian, 2 Food, 3 Service
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_contract_category_check"
  CHECK ("contract_category" IN (1, 2, 3));

-- ContractStatus: 1 Active, 2 Inactive, 3 Expired
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_status_check"
  CHECK ("status" IN (1, 2, 3));

ALTER TABLE "Contract" ADD CONSTRAINT "Contract_dates_check"
  CHECK ("end_date" >= "start_date");

ALTER TABLE "ServiceOffered" ADD CONSTRAINT "ServiceOffered_base_price_check"
  CHECK ("base_price" >= 0);

ALTER TABLE "ServiceOffered" ADD CONSTRAINT "ServiceOffered_surcharge_check"
  CHECK ("surcharge" >= 0);

-- AnimalStatus: 1 Available, 2 Adopted, 3 Reserved, 4 Deceased
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_status_check"
  CHECK ("status" IN (1, 2, 3, 4));

ALTER TABLE "Animal" ADD CONSTRAINT "chk_animal_birth_before_entry"
  CHECK ("birth_date" IS NULL OR "birth_date" <= "entry_date");
