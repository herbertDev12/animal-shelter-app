
CREATE TABLE "ShelterConfiguration" (
    id_config SERIAL PRIMARY KEY,
    maintenance_percentage DECIMAL(5,2) NOT NULL 
);

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
    base_price      DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    
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
    service_type    VARCHAR(100),          -- Clasificación general
    food_type       VARCHAR(100),          -- Solo se llena si es un contrato de alimentos (pienso, húmeda, suplemento)
    
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

CREATE TABLE "ActivitySchedule" (
    id_schedule          SERIAL PRIMARY KEY,
    id_animal            INT NOT NULL,
    id_contract          INT NOT NULL,
    activity_type        VARCHAR(50), 
    description          VARCHAR(300),
    date                 DATE NOT NULL,
    time                 TIME,
    duration_days        INT DEFAULT 1, 
    additional_surcharge DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (id_animal) REFERENCES "Animal"(id_animal),
    FOREIGN KEY (id_contract) REFERENCES "Contract"(id_contract)
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
CREATE INDEX idx_activity_date ON "ActivitySchedule"("date");
CREATE INDEX idx_animals_species ON "Animal"("species");
CREATE INDEX idx_animals_status ON "Animal"("status");
CREATE INDEX idx_animals_created_at ON "Animal"("entry_date" DESC);
CREATE INDEX idx_service_contract ON "ServiceOffered"("id_contract");