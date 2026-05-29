# Database Repository Pattern Guide

This project uses a **Repository Pattern** for database operations, following clean architecture principles with raw SQL queries and NestJS dependency injection.

## 📁 Structure

```
apps/api/
├── src/
│   ├── config/
│   │   └── database.config.ts      # Database connection configuration
│   ├── database/
│   │   ├── database.module.ts      # Database module (DI setup)
│   │   ├── base.repository.ts      # Base class for all repositories
│   │   └── repositories/
│   │       └── animals.repository.ts   # Example repository
│   └── animals/
│       ├── animals.module.ts
│       ├── animals.service.ts
│       └── animals.controller.ts
└── db-init/
    └── 01-schema.sql               # Database schema & migrations
```

## 🔧 Setup

### 1. Install Dependencies

```bash
cd apps/api
pnpm add pg  # PostgreSQL client
```

### 2. Environment Variables

Create `.env` file in the root directory:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=animal_shelter
DB_HOST=localhost
DB_PORT=5432
```

### 3. Database Connection

The database connection is automatically initialized via `DatabaseModule` which:
- Creates a connection pool on app startup
- Makes it available via dependency injection using `@Inject(DATABASE_CONNECTION)`
- Validates connection on startup

## 📝 Creating a New Repository

### 1. Define Interfaces

```typescript
// src/database/repositories/users.repository.ts

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
}

export interface SearchUserFilters {
  name?: string;
  email?: string;
  limit?: number;
  offset?: number;
}
```

### 2. Create Repository Class

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { BaseRepository } from './base.repository';
import { DATABASE_CONNECTION } from '../config/database.config';

@Injectable()
export class UsersRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) private pool: Pool) {
    super(pool);
  }

  // Your methods here...
}
```

### 3. Implement Methods

#### Simple Query (Get All)

```typescript
async findAll(): Promise<User[]> {
  const query = `
    SELECT 
      id,
      name,
      email,
      created_at,
      updated_at
    FROM users
    ORDER BY created_at DESC
  `;
  return this.query<User>(query);
}
```

#### Query with Parameters (Prevent SQL Injection)

```typescript
async findById(id: string): Promise<User | null> {
  const query = `
    SELECT *
    FROM users
    WHERE id = $1
  `;
  return this.queryOne<User>(query, [id]);
}
```

#### Dynamic Search with Filters

```typescript
async search(filters: SearchUserFilters): Promise<User[]> {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramCount = 0;

  if (filters.name) {
    paramCount++;
    conditions.push(`u.name ILIKE $${paramCount}`);
    params.push(`%${filters.name}%`);
  }

  if (filters.email) {
    paramCount++;
    conditions.push(`u.email = $${paramCount}`);
    params.push(filters.email);
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  const limit = filters.limit || 10;
  const offset = filters.offset || 0;

  paramCount++;
  params.push(limit);

  paramCount++;
  params.push(offset);

  const query = `
    SELECT *
    FROM users u
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${paramCount - 1}
    OFFSET $${paramCount}
  `;

  return this.query<User>(query, params);
}
```

#### Create (INSERT)

```typescript
async create(data: CreateUserDto): Promise<User> {
  const query = `
    INSERT INTO users (name, email, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING id, name, email, created_at, updated_at
  `;

  const result = await this.queryOne<User>(query, [
    data.name,
    data.email,
  ]);

  if (!result) {
    throw new Error('Failed to create user');
  }

  return result;
}
```

#### Update

```typescript
async update(id: string, data: Partial<CreateUserDto>): Promise<User> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    paramCount++;
    updates.push(`name = $${paramCount}`);
    params.push(data.name);
  }

  if (data.email !== undefined) {
    paramCount++;
    updates.push(`email = $${paramCount}`);
    params.push(data.email);
  }

  if (updates.length === 0) {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  updates.push(`updated_at = NOW()`);
  params.unshift(id);

  const query = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING id, name, email, created_at, updated_at
  `;

  const result = await this.queryOne<User>(query, params);

  if (!result) {
    throw new Error('User not found');
  }

  return result;
}
```

#### Delete

```typescript
async delete(id: string): Promise<boolean> {
  const query = `
    DELETE FROM users
    WHERE id = $1
  `;

  const result = await this.execute(query, [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}
```

## 🛠 Base Repository Methods

The `BaseRepository` class provides helper methods:

```typescript
// Execute query with params (returns QueryResult)
execute<T>(query: string, values?: any[]): Promise<QueryResult<T>>

// Execute query and return rows
query<T>(query: string, values?: any[]): Promise<T[]>

// Execute query and return single row (or null)
queryOne<T>(query: string, values?: any[]): Promise<T | null>

// Execute query and return count
count(query: string, values?: any[]): Promise<number>
```

## 📌 Best Practices

### ✅ Do's

1. **Always use parameterized queries** - Use `$1, $2, ...` placeholders instead of string concatenation
   ```typescript
   // ✅ GOOD
   this.pool.query('SELECT * FROM users WHERE id = $1', [userId])
   
   // ❌ BAD
   this.pool.query(`SELECT * FROM users WHERE id = ${userId}`)
   ```

2. **Use meaningful parameter counting** - Keep track of `paramCount` in dynamic queries
3. **Include timestamps** - Always track `created_at` and `updated_at`
4. **Use UUIDs for IDs** - UUID v4 is better than sequential IDs for distributed systems
5. **Add proper error handling** - Catch and log database errors
6. **Create indexes** - Add indexes for frequently queried columns

### ❌ Don'ts

1. Don't use string concatenation for query building
2. Don't expose database errors directly to clients
3. Don't fetch all data without pagination/limits
4. Don't forget to update `updated_at` on modifications

## 🔗 Service Layer Integration

Services delegate to repositories:

```typescript
@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findById(id: string) {
    return this.usersRepository.findById(id);
  }

  async create(data: CreateUserDto) {
    // Can add business logic here (validation, etc.)
    return this.usersRepository.create(data);
  }
}
```

## 🚀 Advanced Queries

### Aggregations

```typescript
async getStats(): Promise<Array<{ species: string; count: number }>> {
  const query = `
    SELECT 
      species,
      COUNT(*) as count
    FROM animals
    GROUP BY species
    ORDER BY count DESC
  `;
  
  return this.query(query);
}
```

### Joins

```typescript
async findAnimalsWithAdoptions() {
  const query = `
    SELECT 
      a.id,
      a.name,
      a.species,
      COUNT(ad.id) as total_adoptions,
      ad.last_adoption_date
    FROM animals a
    LEFT JOIN adoptions ad ON a.id = ad.animal_id
    GROUP BY a.id, a.name, a.species
    ORDER BY total_adoptions DESC
  `;
  
  return this.query(query);
}
```

### Transactions

```typescript
async transferAnimal(fromShelter: string, toShelter: string, animalId: string) {
  const client = await this.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update animal location
    await client.query(
      'UPDATE animals SET shelter_id = $1 WHERE id = $2',
      [toShelter, animalId]
    );
    
    // Log the transfer
    await client.query(
      'INSERT INTO animal_transfers (animal_id, from_shelter, to_shelter) VALUES ($1, $2, $3)',
      [animalId, fromShelter, toShelter]
    );
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## 📚 Example: Complete Users Repository

See [animals.repository.ts](./repositories/animals.repository.ts) for a complete example implementation.
