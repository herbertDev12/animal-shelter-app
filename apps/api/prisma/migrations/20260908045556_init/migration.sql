-- CreateTable
CREATE TABLE "Clinic" (
    "id_clinic" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100),
    "address" VARCHAR(200),

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id_clinic")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id_supplier" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(200),
    "type" VARCHAR(50),
    "phone" VARCHAR(20),
    "contact_email" VARCHAR(100),
    "contact_name" VARCHAR(100),
    "province" VARCHAR(100),

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id_supplier")
);

-- CreateTable
CREATE TABLE "Veterinarian" (
    "id_supplier" INTEGER NOT NULL,
    "id_clinic" INTEGER NOT NULL,
    "modality" VARCHAR(50),
    "specialty" VARCHAR(100),
    "fax" VARCHAR(20),
    "veterinarian_email" VARCHAR(100),
    "city_distance" DECIMAL(10,2),

    CONSTRAINT "Veterinarian_pkey" PRIMARY KEY ("id_supplier")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id_contract" SERIAL NOT NULL,
    "id_supplier" INTEGER NOT NULL,
    "contract_category" VARCHAR(50),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reconciliation_date" DATE,
    "description" VARCHAR(300),
    "status" VARCHAR(20) DEFAULT 'Active',

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id_contract")
);

-- CreateTable
CREATE TABLE "TransportService" (
    "id_contract" INTEGER NOT NULL,
    "vehicle" VARCHAR(100),
    "transport_modality" VARCHAR(100),

    CONSTRAINT "TransportService_pkey" PRIMARY KEY ("id_contract")
);

-- CreateTable
CREATE TABLE "ServiceOffered" (
    "id_service" SERIAL NOT NULL,
    "id_contract" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "food_type" VARCHAR(100),
    "base_price" DECIMAL(10,2) NOT NULL,
    "surcharge" DECIMAL(10,2) DEFAULT 0,

    CONSTRAINT "ServiceOffered_pkey" PRIMARY KEY ("id_service")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id_animal" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "species" VARCHAR(50) NOT NULL,
    "breed" VARCHAR(50),
    "birth_date" DATE,
    "weight" DECIMAL(6,2),
    "entry_date" DATE NOT NULL,
    "status" VARCHAR(20) DEFAULT 'available',

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id_animal")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id_activity" SERIAL NOT NULL,
    "id_animal" INTEGER NOT NULL,
    "id_service" INTEGER NOT NULL,
    "description" VARCHAR(300),
    "date" DATE NOT NULL,
    "time" TIME(6),

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id_activity")
);

-- CreateTable
CREATE TABLE "Adoption" (
    "id_adoption" SERIAL NOT NULL,
    "id_animal" INTEGER NOT NULL,
    "adoption_date" DATE NOT NULL,
    "adoption_price" DECIMAL(10,2),

    CONSTRAINT "Adoption_pkey" PRIMARY KEY ("id_adoption")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id_donation" SERIAL NOT NULL,
    "id_animal" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "donor" VARCHAR(100),

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id_donation")
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

-- ---------------------------------------------------------------------------
-- CHECK constraints
--
-- The Prisma schema language cannot express these, so they are added here by
-- hand. Prisma cannot see them either, which means `migrate dev` will never try
-- to drop them. They are also enforced by the Zod schemas in @repo/schemas and,
-- where a PATCH can send only one side of a comparison, re-checked in the
-- service layer against the merged row.
-- ---------------------------------------------------------------------------

ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_type_check"
  CHECK ("type" IN ('Veterinarian', 'Food Company', 'Service Company'));

ALTER TABLE "Contract" ADD CONSTRAINT "Contract_contract_category_check"
  CHECK ("contract_category" IN ('Veterinarian', 'Food', 'Service'));

ALTER TABLE "Contract" ADD CONSTRAINT "Contract_status_check"
  CHECK ("status" IN ('Active', 'Inactive', 'Expired'));

ALTER TABLE "Contract" ADD CONSTRAINT "Contract_dates_check"
  CHECK ("end_date" >= "start_date");

ALTER TABLE "ServiceOffered" ADD CONSTRAINT "ServiceOffered_base_price_check"
  CHECK ("base_price" >= 0);

ALTER TABLE "ServiceOffered" ADD CONSTRAINT "ServiceOffered_surcharge_check"
  CHECK ("surcharge" >= 0);

ALTER TABLE "Animal" ADD CONSTRAINT "Animal_status_check"
  CHECK ("status" IN ('available', 'adopted', 'reserved', 'deceased'));

ALTER TABLE "Animal" ADD CONSTRAINT "chk_animal_birth_before_entry"
  CHECK ("birth_date" IS NULL OR "birth_date" <= "entry_date");
