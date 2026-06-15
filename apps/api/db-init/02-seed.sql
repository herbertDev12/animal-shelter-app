-- Seed data for Animal Shelter DB
-- Runs automatically via docker-entrypoint-initdb.d

-- ============================================
-- 1. ShelterConfiguration
-- ============================================
INSERT INTO "ShelterConfiguration" (id_config, maintenance_percentage)
VALUES (1, 15.00);

-- ============================================
-- 2. Clinic
-- ============================================
INSERT INTO "Clinic" (id_clinic, name, province, address) VALUES
(1, 'VetCare Central', 'San Jose', 'Avenida Central, 125'),
(2, 'Patitas Clinic', 'Alajuela', 'Calle 3, Bloque B'),
(3, 'Animal Hospital Guanacaste', 'Guanacaste', 'Libertad, 800');

-- ============================================
-- 3. Supplier
-- ============================================
INSERT INTO "Supplier" (id_supplier, name, address, type, phone, contact_email, contact_name, province) VALUES
(1, 'VetSuministros CR', 'Zona Industrial, San Jose', 'Veterinarian', '+506 2222 3333', 'contacto@vetsuministros.cr', 'Carlos Mora', 'San Jose'),
(2, 'PetFood Premium', 'La Uruca, San Jose', 'Food Company', '+506 2244 5555', 'ventas@petfood.cr', 'Ana Rodriguez', 'San Jose'),
(3, 'TransPet Costa Rica', 'Cartago centro', 'Service Company', '+506 2555 6666', 'info@transpet.cr', 'Luis Hernandez', 'Cartago'),
(4, 'VetMovil CR', 'Limón centro', 'Service Company', '+506 2777 8888', 'servicios@vetmovil.cr', 'Maria Chen', 'Limón');

-- ============================================
-- 4. Veterinarian
-- ============================================
INSERT INTO "Veterinarian" (id_supplier, id_clinic, modality, specialty, fax, veterinarian_email, city_distance) VALUES
(1, 1, 'In-person', 'General Surgery', '+506 2222 3334', 'carlos@vetsuministros.cr', 5.20),
(4, 2, 'Mobile', 'Exotic Animals', '+506 2777 8889', 'maria@vetmovil.cr', 45.00);

-- ============================================
-- 5. Contract
-- ============================================
INSERT INTO "Contract" (id_contract, id_supplier, contract_category, start_date, end_date, reconciliation_date, description, status) VALUES
(1, 1, 'Veterinarian', '2025-01-01', '2025-12-31', '2025-06-30', 'Annual veterinary supplies contract', 'Active'),
(2, 2, 'Food', '2025-03-01', '2025-12-31', NULL, 'Premium dog and cat food supply', 'Active'),
(3, 3, 'Service', '2025-06-01', '2026-05-31', NULL, 'Animal transport for vet appointments', 'Active'),
(4, 1, 'Veterinarian', '2024-01-01', '2024-12-31', '2024-06-30', 'Previous year veterinary contract', 'Expired');

-- ============================================
-- 6. TransportService
-- ============================================
INSERT INTO "TransportService" (id_contract, vehicle, transport_modality) VALUES
(3, 'Toyota Hiace Van', 'Shared rides, scheduled days'),
(1, NULL, NULL);

-- ============================================
-- 7. ServiceOffered
-- ============================================
INSERT INTO "ServiceOffered" (id_service, id_contract, name, service_type, food_type, base_price) VALUES
(1, 1, 'Consulta General', 'Veterinary Consultation', NULL, 35.00),
(2, 1, 'Vacunación Completa', 'Vaccination', NULL, 55.00),
(3, 2, 'Saco de Pienso 20kg', 'Food', 'Pienso', 42.50),
(4, 2, 'Alimento Húmedo Premium', 'Food', 'Húmeda', 28.00),
(5, 3, 'Traslado Local', 'Transport', NULL, 25.00),
(6, 3, 'Traslado Interprovincial', 'Transport', NULL, 85.00);

-- ============================================
-- 8. Animal (SERIAL PK table)
-- ============================================
INSERT INTO "Animal" (id_animal, name, species, breed, birth_date, weight, entry_date, status) VALUES
(1, 'Max', 'Dog', 'Labrador Retriever', '2022-05-10', 30.50, '2025-01-15', 'available'),
(2, 'Luna', 'Cat', 'Siamese', '2023-02-20', 4.20, '2025-03-01', 'available'),
(3, 'Rocky', 'Dog', 'German Shepherd', '2021-11-05', 38.00, '2024-11-20', 'adopted'),
(4, 'Nala', 'Cat', 'Persian', '2024-01-10', 3.80, '2025-06-10', 'available'),
(5, 'Toby', 'Dog', 'Beagle', '2023-07-15', 12.30, '2025-04-22', 'available'),
(6, 'Milo', 'Rabbit', 'Holland Lop', '2024-03-01', 1.50, '2025-07-05', 'available'),
(7, 'Bella', 'Dog', 'Poodle', '2022-09-18', 6.70, '2025-02-14', 'adopted'),
(8, 'Simba', 'Cat', 'Maine Coon', '2023-12-25', 6.10, '2025-05-30', 'deceased');

-- Synchronize sequences for SERIAL columns
SELECT setval(pg_get_serial_sequence('"ShelterConfiguration"', 'id_config'), COALESCE(MAX(id_config), 1)) FROM "ShelterConfiguration";
SELECT setval(pg_get_serial_sequence('"Clinic"', 'id_clinic'), COALESCE(MAX(id_clinic), 1)) FROM "Clinic";
SELECT setval(pg_get_serial_sequence('"Supplier"', 'id_supplier'), COALESCE(MAX(id_supplier), 1)) FROM "Supplier";
SELECT setval(pg_get_serial_sequence('"Contract"', 'id_contract'), COALESCE(MAX(id_contract), 1)) FROM "Contract";
SELECT setval(pg_get_serial_sequence('"ServiceOffered"', 'id_service'), COALESCE(MAX(id_service), 1)) FROM "ServiceOffered";
SELECT setval(pg_get_serial_sequence('"Animal"', 'id_animal'), COALESCE(MAX(id_animal), 1)) FROM "Animal";
SELECT setval(pg_get_serial_sequence('"ActivitySchedule"', 'id_schedule'), COALESCE(MAX(id_schedule), 1)) FROM "ActivitySchedule";
SELECT setval(pg_get_serial_sequence('"Adoption"', 'id_adoption'), COALESCE(MAX(id_adoption), 1)) FROM "Adoption";
SELECT setval(pg_get_serial_sequence('"Donation"', 'id_donation'), COALESCE(MAX(id_donation), 1)) FROM "Donation";

-- ============================================
-- 9. ActivitySchedule
-- ============================================
INSERT INTO "ActivitySchedule" (id_schedule, id_animal, id_contract, activity_type, description, date, time, duration_days, additional_surcharge) VALUES
(1, 1, 1, 'Vaccination', 'Annual rabies and distemper vaccination', '2025-07-15', '09:00:00', 1, 0.00),
(2, 2, 2, 'Feeding', 'Daily nutrition plan - senior cat formula', '2025-07-10', '08:00:00', 30, 150.00),
(3, 5, 3, 'Transport', 'Transport to VetCare Central for check-up', '2025-08-01', '10:30:00', 1, 25.00),
(4, 4, 1, 'Medical Checkup', 'Routine health examination', '2025-07-20', '14:00:00', 1, 0.00);

-- ============================================
-- 10. Adoption
-- ============================================
INSERT INTO "Adoption" (id_adoption, id_animal, adoption_date, adoption_price) VALUES
(1, 3, '2025-04-10', 150.00),
(2, 7, '2025-06-01', 120.00);

-- ============================================
-- 11. Donation
-- ============================================
INSERT INTO "Donation" (id_donation, id_animal, amount, date, donor) VALUES
(1, 1, 50.00, '2025-03-15', 'Maria Gutierrez'),
(2, 2, 200.00, '2025-05-20', 'Pedro Alvarez'),
(3, 5, 75.00, '2025-06-18', 'Fundacion Patitas Felices');


