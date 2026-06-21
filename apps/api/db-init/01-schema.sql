
CREATE TABLE "Clinic" (
    id_clinic SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    province  VARCHAR(100),
    address   VARCHAR(200)
);

CREATE TABLE "Supplier" (
    id_supplier   SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    address       VARCHAR(200),
    type          VARCHAR(50) CHECK (type IN ('Veterinarian', 'Food Company', 'Service Company')),
    phone         VARCHAR(20),
    contact_email VARCHAR(100),
    contact_name  VARCHAR(100),
    province      VARCHAR(100)
);

CREATE TABLE "Veterinarian" (
    id_supplier        INT PRIMARY KEY,
    id_clinic          INT NOT NULL, 
    modality           VARCHAR(50),
    specialty          VARCHAR(100),
    fax                VARCHAR(20),
    veterinarian_email VARCHAR(100),
    city_distance      DECIMAL(10,2),
    FOREIGN KEY (id_supplier) REFERENCES "Supplier"(id_supplier),
    FOREIGN KEY (id_clinic) REFERENCES "Clinic"(id_clinic)
);

CREATE TABLE "Contract" (
    id_contract         SERIAL PRIMARY KEY,
    id_supplier         INT NOT NULL,
    contract_category   VARCHAR(50) CHECK (contract_category IN ('Veterinarian', 'Food', 'Service')),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    reconciliation_date DATE,
    description         VARCHAR(300),
    status              VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Expired')),

    CHECK (end_date >= start_date),
    FOREIGN KEY (id_supplier) REFERENCES "Supplier"(id_supplier)
);

CREATE TABLE "TransportService" (
    id_contract        INT PRIMARY KEY,
    vehicle            VARCHAR(100),
    transport_modality VARCHAR(100),
    FOREIGN KEY (id_contract) REFERENCES "Contract"(id_contract)
);

CREATE TABLE "ServiceOffered" (
    id_service      SERIAL PRIMARY KEY,
    id_contract     INT NOT NULL,
    name            VARCHAR(100) NOT NULL, -- Ej: "Consulta General", "Saco de Pienso 20kg", "Traslado Local"
    food_type       VARCHAR(100),          -- Solo se llena si es un contrato de alimentos (pienso, húmeda, suplemento)
    base_price      DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),  -- precio base del servicio específico
    surcharge       DECIMAL(10,2) DEFAULT 0 CHECK (surcharge >= 0),  -- recargo opcional

    FOREIGN KEY (id_contract) REFERENCES "Contract"(id_contract)
);

CREATE TABLE "Animal" (
    id_animal  SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    species    VARCHAR(50) NOT NULL,
    breed      VARCHAR(50),
    birth_date DATE,
    weight     DECIMAL(6,2),
    entry_date DATE NOT NULL,
    status     VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'adopted', 'reserved', 'deceased'))
);

CREATE TABLE "Activity" (
    id_activity          SERIAL PRIMARY KEY,
    id_animal            INT NOT NULL,
    id_service           INT NOT NULL,
    description          VARCHAR(300),
    date                 DATE NOT NULL,
    time                 TIME,
    FOREIGN KEY (id_animal) REFERENCES "Animal"(id_animal),
    FOREIGN KEY (id_service) REFERENCES "ServiceOffered"(id_service)
);

CREATE TABLE "Adoption" (
    id_adoption SERIAL PRIMARY KEY,
    id_animal INT NOT NULL,
    adoption_date DATE NOT NULL,
    adoption_price DECIMAL(10,2),
    FOREIGN KEY (id_animal) REFERENCES "Animal"(id_animal)
);

CREATE TABLE "Donation" (
    id_donation SERIAL PRIMARY KEY,
    id_animal INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    donor VARCHAR(100),
    FOREIGN KEY (id_animal) REFERENCES "Animal"(id_animal)
);


CREATE INDEX idx_supplier_province ON "Supplier"("province");
CREATE INDEX idx_supplier_type ON "Supplier"("type");
CREATE INDEX idx_contract_category ON "Contract"("contract_category");
CREATE INDEX idx_contract_dates ON "Contract"("start_date", "end_date");
CREATE INDEX idx_contract_status ON "Contract"("status");
CREATE INDEX idx_activity_date ON "Activity"("date");
CREATE INDEX idx_activity_service ON "Activity"("id_service");
CREATE INDEX idx_animals_species ON "Animal"("species");
CREATE INDEX idx_animals_status ON "Animal"("status");
CREATE INDEX idx_animals_created_at ON "Animal"("entry_date" DESC);
CREATE INDEX idx_service_contract ON "ServiceOffered"("id_contract");


CREATE OR REPLACE FUNCTION fn_auto_expire_contract()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'Active' THEN
    NEW.status := 'Expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_expire_contract
BEFORE INSERT OR UPDATE ON "Contract"
FOR EACH ROW EXECUTE FUNCTION fn_auto_expire_contract();

CREATE OR REPLACE FUNCTION fn_validate_contract_active()
RETURNS TRIGGER AS $$
DECLARE
  v_status VARCHAR(20);
  v_id_contract INT;
BEGIN
  SELECT c.id_contract, c.status
    INTO v_id_contract, v_status
  FROM "ServiceOffered" so
  JOIN "Contract" c ON c.id_contract = so.id_contract
  WHERE so.id_service = NEW.id_service;
  IF v_id_contract IS NULL THEN
    RAISE EXCEPTION 'Service % does not exist or has no contract', NEW.id_service;
  END IF;
  IF v_status <> 'Active' THEN
    RAISE EXCEPTION 'Contract % is not active (status: %)', v_id_contract, v_status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_contract_active
BEFORE INSERT OR UPDATE ON "Activity"
FOR EACH ROW EXECUTE FUNCTION fn_validate_contract_active();