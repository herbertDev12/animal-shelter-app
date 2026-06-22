# Documentación de las queries SQL de `reports.repository.ts`

Este documento explica, **línea a línea**, cada consulta SQL del repositorio de informes
(`apps/api/src/modules/reports/reports.repository.ts`). El repositorio está construido sobre
NestJS y el cliente `pg` (PostgreSQL), y extiende `BaseRepository`, del que hereda los helpers
`this.count(...)` y `this.query<T>(...)`.

---

## Conceptos transversales (válidos para todos los métodos)

Antes de entrar en cada método conviene fijar varios patrones que se repiten en todas las queries:

### Paginación con parámetros posicionales (`$1`, `$2`, …)

PostgreSQL usa marcadores posicionales `$1`, `$2`, etc. en lugar de interpolar valores en el
string (esto previene inyección SQL). En el código se construyen así:

```ts
const params: unknown[] = [];   // array de valores que se enlazan a $1, $2, ...
let paramCount = 0;             // contador de cuántos parámetros llevamos

paramCount++; params.push(limit);   // limit  -> ocupa la posición $paramCount
paramCount++; params.push(offset);  // offset -> ocupa la posición $paramCount
```

Y luego, dentro del SQL, se generan los placeholders con template literals:

```ts
LIMIT $${paramCount - 1}   // p. ej. $1 (limit)
OFFSET $${paramCount}      // p. ej. $2 (offset)
```

- **`LIMIT`** acota cuántas filas devuelve la página.
- **`OFFSET`** salta las filas de las páginas anteriores.

### Helpers heredados de `BaseRepository`

- **`this.count(query, params?)`**: ejecuta una consulta `SELECT COUNT(*) ... as count` y
  devuelve el número total de filas (sin paginar). Sirve para calcular el `total` que se
  retorna junto con la página de datos.
- **`this.query<T>(query, params)`**: ejecuta la consulta de datos y devuelve un array de filas
  tipadas como `T`.

### Funciones y casteos SQL recurrentes

- **`COALESCE(x, 0)`**: devuelve `x`, salvo que sea `NULL`, en cuyo caso devuelve `0`. Se usa
  para que sumas y precios nunca se vuelvan `NULL` por falta de datos.
- **`::float8` / `::int`**: casteo explícito del resultado a número de punto flotante de 8 bytes
  (`double precision`) o a entero. Garantiza que la API reciba números y no `string`/`numeric`.
- **Identificadores entre comillas dobles** (`"Contract"`, `"Veterinarian"`): las tablas usan
  PascalCase, por lo que deben ir entrecomilladas para que PostgreSQL respete las mayúsculas
  (sin comillas, las plegaría a minúsculas).
- **`EXTRACT(YEAR FROM age(CURRENT_DATE, fecha))`**: calcula la edad en años completos entre
  hoy y `fecha`. `age()` devuelve un intervalo y `EXTRACT(YEAR ...)` toma sólo los años.
- **`CURRENT_DATE`**: fecha actual del servidor (sin hora).

### Porcentaje de mantenimiento

El método privado `getMaintenancePercentage()` lee la variable de entorno
`MAINTENANCE_PERCENTAGE` (por defecto `15`). Este porcentaje **no se aplica en SQL**, sino en
TypeScript tras obtener las filas, en los métodos que calculan costes de mantenimiento.

---

## 1. `findReconciledVeterinarianContracts`

**Propósito:** listar los contratos de **veterinarios** que ya han sido **conciliados**
(`reconciliation_date IS NOT NULL`), con datos del veterinario, su clínica y su proveedor.

### Query de conteo (`countQuery`)

```sql
SELECT COUNT(*) as count
FROM "Contract" ct
INNER JOIN "Veterinarian" v ON ct.id_supplier = v.id_supplier
WHERE ct.reconciliation_date IS NOT NULL
AND ct.contract_category = 'Veterinarian';
```

- `SELECT COUNT(*) as count`: cuenta el total de filas que cumplen el filtro (alias `count`).
- `FROM "Contract" ct`: parte de la tabla de contratos, alias `ct`.
- `INNER JOIN "Veterinarian" v ON ct.id_supplier = v.id_supplier`: une cada contrato con su
  veterinario, emparejando por el proveedor (`id_supplier`). Al ser `INNER`, descarta contratos
  sin veterinario asociado.
- `WHERE ct.reconciliation_date IS NOT NULL`: sólo contratos **conciliados**.
- `AND ct.contract_category = 'Veterinarian'`: restringe a la categoría veterinaria.

### Query de datos (`dataQuery`)

```sql
SELECT
 s.name as veterinarian_name,
 c.name as clinic_name,
 c.province,
 c.address,
 v.specialty,
 ct.start_date,
 ct.end_date,
 ct.reconciliation_date,
 ct.description
FROM "Contract" ct
INNER JOIN "Veterinarian" v ON ct.id_supplier = v.id_supplier
INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier
INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic
WHERE ct.reconciliation_date IS NOT NULL
 AND ct.contract_category = 'Veterinarian'
ORDER BY ct.reconciliation_date DESC
LIMIT $1
OFFSET $2
```

- `s.name as veterinarian_name`: nombre del proveedor (la persona/entidad veterinaria), renombrado.
- `c.name as clinic_name`: nombre de la clínica.
- `c.province`, `c.address`: provincia y dirección de la clínica.
- `v.specialty`: especialidad del veterinario.
- `ct.start_date`, `ct.end_date`: fechas de inicio y fin del contrato.
- `ct.reconciliation_date`: fecha de conciliación.
- `ct.description`: descripción del contrato.
- `FROM "Contract" ct`: tabla base de contratos.
- `INNER JOIN "Veterinarian" v ...`: une con el veterinario por `id_supplier`.
- `INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier`: une con el proveedor para obtener
  el nombre (`s.name`).
- `INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic`: une con la clínica del veterinario.
- `WHERE ... reconciliation_date IS NOT NULL AND contract_category = 'Veterinarian'`: mismos
  filtros que el conteo (conciliados + categoría veterinaria).
- `ORDER BY ct.reconciliation_date DESC`: ordena por fecha de conciliación, más recientes primero.
- `LIMIT $1` / `OFFSET $2`: paginación (`$1 = limit`, `$2 = offset`).

---

## 2. `findFoodSupplierContracts`

**Propósito:** listar los contratos **conciliados** de la categoría **comida** (`Food`),
mostrando proveedor, tipo de comida y ubicación.

### Query de conteo (`countQuery`)

```sql
SELECT COUNT(*) as count
FROM "Contract" ct
INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract
WHERE ct.reconciliation_date IS NOT NULL
AND ct.contract_category = 'Food';
```

- `FROM "Contract" ct`: contratos.
- `INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract`: une cada contrato con los
  servicios ofertados asociados (por `id_contract`). Aquí se usa para obtener el `food_type`.
- `WHERE ct.reconciliation_date IS NOT NULL AND ct.contract_category = 'Food'`: conciliados y de
  categoría comida.

> Nota: como un contrato puede tener varios `ServiceOffered`, este `COUNT(*)` cuenta combinaciones
> contrato-servicio, no contratos únicos.

### Query de datos (`dataQuery`)

```sql
SELECT
 s.name as supplier_name,
 so.food_type,
 s.province,
 s.address,
 ct.start_date,
 ct.end_date,
 ct.reconciliation_date,
 ct.description
FROM "Contract" ct
INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract
INNER JOIN "Supplier" s ON ct.id_supplier = s.id_supplier
WHERE ct.reconciliation_date IS NOT NULL
 AND ct.contract_category = 'Food'
ORDER BY ct.reconciliation_date DESC
LIMIT $1
OFFSET $2
```

- `s.name as supplier_name`: nombre del proveedor de comida.
- `so.food_type`: tipo de comida ofertada en el servicio.
- `s.province`, `s.address`: ubicación del proveedor (aquí del `Supplier`, no de una clínica).
- `ct.start_date`, `ct.end_date`, `ct.reconciliation_date`, `ct.description`: datos del contrato.
- `INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract`: obtiene el `food_type`.
- `INNER JOIN "Supplier" s ON ct.id_supplier = s.id_supplier`: obtiene los datos del proveedor.
- `WHERE`/`ORDER BY`/`LIMIT`/`OFFSET`: igual que en el método anterior pero filtrando por `'Food'`.

---

## 3. `findComplementaryServiceContracts`

**Propósito:** listar los contratos **conciliados** de la categoría **servicio**
(`Service` — servicios complementarios), incluyendo el **coste por servicio** calculado.

### Query de conteo (`countQuery`)

```sql
SELECT COUNT(*) as count
FROM "Contract" ct
INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract
WHERE ct.reconciliation_date IS NOT NULL
AND ct.contract_category = 'Service';
```

Idéntica estructura a la de comida, pero filtrando `contract_category = 'Service'`.

### Query de datos (`dataQuery`)

```sql
SELECT
 ct.start_date,
 ct.end_date,
 ct.reconciliation_date,
 ct.description,
 so.name as service_name,
 (COALESCE(so.base_price, 0) + COALESCE(so.surcharge, 0))::float8 as cost_per_service,
 s.province
FROM "Contract" ct
INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract
INNER JOIN "Supplier" s ON ct.id_supplier = s.id_supplier
WHERE ct.reconciliation_date IS NOT NULL
 AND ct.contract_category = 'Service'
ORDER BY ct.reconciliation_date DESC
LIMIT $1
OFFSET $2
```

- `ct.start_date`, `ct.end_date`, `ct.reconciliation_date`, `ct.description`: datos del contrato.
- `so.name as service_name`: nombre del servicio ofertado.
- `(COALESCE(so.base_price, 0) + COALESCE(so.surcharge, 0))::float8 as cost_per_service`:
  **coste del servicio** = precio base + recargo. Cada componente se protege con `COALESCE(...,0)`
  por si es `NULL`, y el total se castea a `float8`.
- `s.province`: provincia del proveedor.
- `INNER JOIN "ServiceOffered" so ...`: trae el nombre y precios del servicio.
- `INNER JOIN "Supplier" s ...`: trae la provincia del proveedor.
- `WHERE`/`ORDER BY`/`LIMIT`/`OFFSET`: conciliados + categoría `'Service'`, paginado.

---

## 4. `findActiveVeterinarians`

**Propósito:** listar los **veterinarios con contrato activo**, con filtros **opcionales** por
clínica (`clinic_id`) y/o provincia (`province`).

### Construcción dinámica del `WHERE`

A diferencia de los anteriores, aquí el `WHERE` se construye en TypeScript a partir de un array
de condiciones, añadiendo filtros sólo si llegan los parámetros opcionales:

```ts
const conditions: string[] = [
  `s.type = 'Veterinarian'`,         // el proveedor es de tipo veterinario
  `ct.contract_category = 'Veterinarian'`,  // el contrato es veterinario
  `ct.status = 'Active'`,            // el contrato está activo
];

if (clinic_id) {                     // filtro opcional por clínica
  paramCount++; params.push(clinic_id);
  conditions.push(`c.id_clinic = $${paramCount}`);
}
if (province) {                      // filtro opcional por provincia
  paramCount++; params.push(province);
  conditions.push(`c.province = $${paramCount}`);
}

const whereClause = conditions.join('\n      AND ');  // se unen con AND
```

Importante: como `clinic_id`/`province` se enlazan **antes** que `limit`/`offset`, las
posiciones `$n` de la paginación se desplazan según cuántos filtros opcionales se hayan añadido.

### Query de conteo (`countQuery`)

```sql
SELECT COUNT(DISTINCT v.id_supplier) as count
FROM "Veterinarian" v
INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier
INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic
INNER JOIN "Contract" ct ON v.id_supplier = ct.id_supplier
WHERE <whereClause>;
```

- `COUNT(DISTINCT v.id_supplier)`: cuenta **veterinarios únicos**. Se usa `DISTINCT` porque un
  veterinario puede tener varios contratos y el JOIN multiplicaría filas; así no se cuenta varias veces.
- `FROM "Veterinarian" v`: parte de los veterinarios.
- `INNER JOIN "Supplier" s ...`: une con su proveedor (para `s.type`, `s.name`, contacto…).
- `INNER JOIN "Clinic" c ...`: une con su clínica (para provincia y filtro por clínica).
- `INNER JOIN "Contract" ct ...`: une con sus contratos (para filtrar por estado/categoría).
- `WHERE <whereClause>`: condiciones fijas (`type`, `category`, `status='Active'`) más los
  filtros opcionales.

### Query de datos (`dataQuery`)

```sql
SELECT
 CURRENT_DATE as date,
 s.name as veterinarian_name,
 c.name as clinic_name,
 c.province,
 v.specialty,
 s.phone,
 v.fax,
 COALESCE(v.veterinarian_email, s.contact_email) as email,
 v.city_distance as distance_to_nearest_city,
 v.modality as modalities
FROM "Veterinarian" v
INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier
INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic
INNER JOIN "Contract" ct ON v.id_supplier = ct.id_supplier
WHERE <whereClause>
ORDER BY s.name
LIMIT $n-1
OFFSET $n
```

- `CURRENT_DATE as date`: fecha de generación del informe (la fecha de hoy).
- `s.name as veterinarian_name`: nombre del veterinario (proveedor).
- `c.name as clinic_name`, `c.province`: clínica y provincia.
- `v.specialty`: especialidad.
- `s.phone`: teléfono del proveedor.
- `v.fax`: fax del veterinario.
- `COALESCE(v.veterinarian_email, s.contact_email) as email`: usa el email propio del veterinario
  y, si no tiene, cae al email de contacto del proveedor.
- `v.city_distance as distance_to_nearest_city`: distancia a la ciudad más cercana.
- `v.modality as modalities`: modalidad(es) de atención.
- Los cuatro `INNER JOIN`: mismos que en el conteo.
- `WHERE <whereClause>`: mismas condiciones (fijas + opcionales).
- `ORDER BY s.name`: orden alfabético por nombre del veterinario.
- `LIMIT`/`OFFSET`: paginación; sus posiciones `$n` dependen de cuántos filtros opcionales se usaron.

> A diferencia del conteo, la query de datos **no** usa `DISTINCT`: si un veterinario tuviera
> varios contratos activos que cumplen el filtro, podría aparecer repetido en los resultados.

---

## 5. `findAnimalCareSchedule`

**Propósito:** obtener la **agenda de cuidados** de un animal concreto (`id_animal`), con sus
actividades, precios por actividad y varios **totales agregados** (veterinaria, transporte,
comida y coste total de actividades). Es la query más compleja del fichero.

### Query de conteo (`countQuery`)

```sql
SELECT COUNT(*) as count
FROM "Activity" act
INNER JOIN "Animal" a ON act.id_animal = a.id_animal
WHERE a.id_animal = $1;
```

- Cuenta cuántas **actividades** tiene el animal `$1`.
- `INNER JOIN "Animal" a ON act.id_animal = a.id_animal`: une cada actividad con su animal.
- `WHERE a.id_animal = $1`: filtra por el animal solicitado.

### Query principal (`mainQuery`)

```sql
SELECT
  a.name              as animal_name,
  a.species,
  a.breed,
  EXTRACT(YEAR FROM age(CURRENT_DATE, a.birth_date))::int as age,
  a.weight,
  (CURRENT_DATE - a.entry_date)::int                      as days_in_shelter,
  act.date            as "day",
  act.time            as hour,
  act.description     as activity_description,
  (COALESCE(so.base_price, 0) + COALESCE(so.surcharge, 0))::float8 as price,
  vet_s.name          as assigned_veterinarian_name,
  so.food_type        as assigned_food_type,
  ...
```

Columnas directas:

- `a.name as animal_name`, `a.species`, `a.breed`: nombre, especie y raza del animal.
- `EXTRACT(YEAR FROM age(CURRENT_DATE, a.birth_date))::int as age`: edad en años completos.
- `a.weight`: peso.
- `(CURRENT_DATE - a.entry_date)::int as days_in_shelter`: días que el animal lleva en el refugio
  (resta de fechas → número de días, casteado a entero).
- `act.date as "day"`: fecha de la actividad (entrecomillada porque `day` puede ser palabra reservada).
- `act.time as hour`: hora de la actividad.
- `act.description as activity_description`: descripción de la actividad.
- `(COALESCE(so.base_price,0) + COALESCE(so.surcharge,0))::float8 as price`: precio de **esa**
  actividad (base + recargo del servicio asociado).
- `vet_s.name as assigned_veterinarian_name`: nombre del veterinario asignado (vía LEFT JOIN; puede
  ser `NULL` si la actividad no es veterinaria).
- `so.food_type as assigned_food_type`: tipo de comida asignada (si aplica).

#### Subconsultas correlacionadas (totales por animal)

Cada una recorre **todas** las actividades del mismo animal (`= a.id_animal`) y suma precios
(base + recargo, con `COALESCE`). Son "correlacionadas" porque dependen de `a.id_animal` de la
fila externa.

```sql
(SELECT COALESCE(SUM(COALESCE(so_vet.base_price, 0) + COALESCE(so_vet.surcharge, 0)), 0)
 FROM "Activity" act_vet
 INNER JOIN "ServiceOffered" so_vet ON act_vet.id_service = so_vet.id_service
 INNER JOIN "Contract" ct_vet ON so_vet.id_contract = ct_vet.id_contract
 WHERE act_vet.id_animal = a.id_animal
   AND ct_vet.contract_category = 'Veterinarian'
) as total_veterinary_care_price,
```

- **`total_veterinary_care_price`**: suma del coste de todas las actividades del animal cuyo
  contrato es de categoría `'Veterinarian'`. Une `Activity → ServiceOffered → Contract` y filtra
  por animal y categoría veterinaria.

```sql
(SELECT COALESCE(SUM(COALESCE(so_transp.base_price, 0) + COALESCE(so_transp.surcharge, 0)), 0)
 FROM "Activity" act_transp
 INNER JOIN "ServiceOffered" so_transp ON act_transp.id_service = so_transp.id_service
 INNER JOIN "Contract" ct_transp ON so_transp.id_contract = ct_transp.id_contract
 INNER JOIN "TransportService" ts ON ct_transp.id_contract = ts.id_contract
 WHERE act_transp.id_animal = a.id_animal
) as transport_price,
```

- **`transport_price`**: suma del coste de las actividades del animal asociadas a un contrato que
  tiene **servicio de transporte**. El `INNER JOIN "TransportService" ts` actúa como filtro:
  sólo cuentan los contratos que existen en `TransportService`.

```sql
(SELECT COALESCE(SUM(COALESCE(so_food.base_price, 0) + COALESCE(so_food.surcharge, 0)), 0)
 FROM "Activity" act_food
 INNER JOIN "ServiceOffered" so_food ON act_food.id_service = so_food.id_service
 INNER JOIN "Contract" ct_food ON so_food.id_contract = ct_food.id_contract
 WHERE act_food.id_animal = a.id_animal
   AND ct_food.contract_category = 'Food'
) as total_food_price,
```

- **`total_food_price`**: suma del coste de las actividades del animal cuyo contrato es de
  categoría `'Food'`.

```sql
(SELECT COALESCE(SUM(COALESCE(so_all.base_price, 0) + COALESCE(so_all.surcharge, 0)), 0)
 FROM "Activity" act_all
 INNER JOIN "ServiceOffered" so_all ON act_all.id_service = so_all.id_service
 WHERE act_all.id_animal = a.id_animal
) as total_activity_cost
```

- **`total_activity_cost`**: suma del coste de **todas** las actividades del animal, sin filtrar
  por categoría. Es la base sobre la que se calcula el coste de mantenimiento en TypeScript.

#### `FROM` y JOINs de la query externa

```sql
FROM "Animal" a
INNER JOIN "Activity" act ON a.id_animal = act.id_animal
LEFT JOIN "ServiceOffered" so ON act.id_service = so.id_service
LEFT JOIN "Contract" ct ON so.id_contract = ct.id_contract
LEFT JOIN "Veterinarian" v ON ct.id_supplier = v.id_supplier
  AND ct.contract_category = 'Veterinarian'
LEFT JOIN "Supplier" vet_s ON v.id_supplier = vet_s.id_supplier
WHERE a.id_animal = $1
ORDER BY act.date, act.time
LIMIT $n-1
OFFSET $n
```

- `FROM "Animal" a`: animal base.
- `INNER JOIN "Activity" act ...`: une con sus actividades (cada fila = una actividad).
- `LEFT JOIN "ServiceOffered" so ...`: une con el servicio de la actividad. Es `LEFT` para no
  perder actividades que no tengan servicio asociado (en ese caso `so.*` será `NULL`).
- `LEFT JOIN "Contract" ct ...`: une con el contrato del servicio.
- `LEFT JOIN "Veterinarian" v ON ct.id_supplier = v.id_supplier AND ct.contract_category = 'Veterinarian'`:
  une con el veterinario **sólo** cuando el contrato es veterinario (condición dentro del `ON`).
- `LEFT JOIN "Supplier" vet_s ...`: trae el nombre del veterinario asignado (`vet_s.name`).
- `WHERE a.id_animal = $1`: limita a las actividades del animal solicitado.
- `ORDER BY act.date, act.time`: ordena cronológicamente (fecha y luego hora).
- `LIMIT`/`OFFSET`: paginación (`$1` es el animal; `limit`/`offset` ocupan `$2`/`$3`).

#### Post-procesado en TypeScript

El coste de mantenimiento **no** se calcula en SQL:

```ts
const pct = this.getMaintenancePercentage();   // p. ej. 15
const data = rows.map((row) => ({
  ...row,
  maintenance_percentage: pct,
  total_maintenance_cost: Number(row.total_activity_cost) * (1 + pct / 100),
}));
```

- `total_maintenance_cost` = coste total de actividades **incrementado** en el porcentaje de
  mantenimiento. Con `pct = 15`, es `total_activity_cost * 1.15`.

---

## 6. `findRevenuePlan`

**Propósito:** generar un **plan de ingresos** por animal, resumiendo coste de actividades,
ingresos por adopción y donaciones, y el total de ingresos.

### Query de conteo (`countQuery`)

```sql
SELECT COUNT(*) as count
FROM "Animal" a;
```

- Cuenta **todos** los animales (el informe tiene una fila por animal, sin filtros).

### Query de datos (`dataQuery`)

```sql
SELECT
  a.name as animal_name,
  a.species,
  a.breed,
  EXTRACT(YEAR FROM age(CURRENT_DATE, a.birth_date))::int as age,
  (
    SELECT COALESCE(SUM(COALESCE(so.base_price, 0) + COALESCE(so.surcharge, 0)), 0)
    FROM "Activity" act
    INNER JOIN "ServiceOffered" so ON act.id_service = so.id_service
    WHERE act.id_animal = a.id_animal
  )::float8 as total_activity_cost,
  COALESCE(
    (SELECT SUM(adp.adoption_price) FROM "Adoption" adp WHERE adp.id_animal = a.id_animal),
    0
  )::float8 as total_adoption_fee,
  COALESCE(
    (SELECT SUM(d.amount) FROM "Donation" d WHERE d.id_animal = a.id_animal),
    0
  )::float8 as total_donations,
  (
    COALESCE(
      (SELECT SUM(adp.adoption_price) FROM "Adoption" adp WHERE adp.id_animal = a.id_animal),
      0
    )
    +
    COALESCE(
      (SELECT SUM(d.amount) FROM "Donation" d WHERE d.id_animal = a.id_animal),
      0
    )
  )::float8 as total_revenue
FROM "Animal" a
ORDER BY a.name
LIMIT $1
OFFSET $2
```

- `a.name as animal_name`, `a.species`, `a.breed`: datos básicos del animal.
- `EXTRACT(YEAR FROM age(CURRENT_DATE, a.birth_date))::int as age`: edad en años.
- **`total_activity_cost`** (subconsulta correlacionada): suma del coste (base + recargo) de
  todas las actividades del animal. Une `Activity → ServiceOffered` y filtra por `a.id_animal`.
- **`total_adoption_fee`**: suma de los precios de adopción del animal en la tabla `"Adoption"`.
  El `COALESCE(..., 0)` envuelve la subconsulta para que, si el animal no tiene adopciones
  (la suma sería `NULL`), devuelva `0`.
- **`total_donations`**: suma de los importes (`amount`) de las donaciones del animal en la tabla
  `"Donation"`, con el mismo patrón `COALESCE(subconsulta, 0)`.
- **`total_revenue`**: ingresos totales = adopciones + donaciones. Repite ambas subconsultas
  (cada una con su `COALESCE`) y las suma. Castea a `float8`.
- `FROM "Animal" a`: una fila por animal.
- `ORDER BY a.name`: orden alfabético por nombre del animal.
- `LIMIT $1` / `OFFSET $2`: paginación.

> Nota: `total_activity_cost` (un **coste**) no se resta de `total_revenue` (un **ingreso**) en
> esta query; ambos se devuelven por separado para que el consumidor del informe los combine.

#### Post-procesado en TypeScript

```ts
const pct = this.getMaintenancePercentage();
const data = rows.map((row) => ({
  ...row,
  total_maintenance_cost: Number(row.total_activity_cost) * (1 + pct / 100),
}));
```

- `total_maintenance_cost` = `total_activity_cost` incrementado en el porcentaje de mantenimiento
  (igual que en `findAnimalCareSchedule`).

---

## Resumen de tablas implicadas

| Tabla              | Rol en los informes                                            |
| ------------------ | ------------------------------------------------------------- |
| `Contract`         | Contratos (categoría, fechas, conciliación, estado).          |
| `Supplier`         | Proveedor genérico (nombre, contacto, provincia, dirección).  |
| `Veterinarian`     | Datos específicos del veterinario (especialidad, email, fax). |
| `Clinic`           | Clínica del veterinario (nombre, provincia).                  |
| `ServiceOffered`   | Servicios ofertados (precio base, recargo, tipo de comida).   |
| `TransportService` | Marca los contratos que incluyen transporte.                  |
| `Animal`           | Animales del refugio (especie, raza, fechas, peso).           |
| `Activity`         | Actividades realizadas con cada animal.                       |
| `Adoption`         | Adopciones y su precio.                                        |
| `Donation`         | Donaciones y su importe.                                       |
