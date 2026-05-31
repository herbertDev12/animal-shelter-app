## **Overview**

The monorepo uses **pnpm workspaces** with **4 shared packages** under packages:

1. **`@repo/schemas`** — Zod validation + NestJS DTOs
2. **`@repo/ui`** — React components
3. **`@repo/typescript-config`** — Shared TypeScript config

---

## **1. Monorepo Root Setup**

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### turbo.json (Build Orchestration)

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"], // Dependencies build first
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["@repo/data#build", "@repo/schemas#build"] // Packages must build before apps
    }
  }
}
```

**Key Point**: Turbo ensures `@repo/schemas` and `@repo/data` build before apps start.

### Root package.json

```json
{
  "type": "module",
  "packageManager": "pnpm@9.0.0",
  "engines": { "node": ">=18" },
  "pnpm": {
    "overrides": {
      "zod": "^3.25.42" // Ensures all packages use same Zod version
    }
  }
}
```

---

## **2. `@repo/schemas` Package**

**Purpose**: Single source of truth for validation (Zod) and API DTOs (NestJS).

### Structure

```
packages/schemas/
├── package.json
├── tsconfig.json
├── tsconfig.cjs.json       # Secondary: CommonJS output
└── src/
    ├── auth/
    │   ├── auth.ts         # Zod schemas
    │   └── auth.dto.ts     # NestJS DTOs
    ├── jobs/
    ├── tasks/
    └── ... (other domains)
```

### package.json

```json
{
  "name": "@repo/schemas",
  "type": "commonjs",
  "exports": {
    "./*": {
      "import": "./src/*", // ESM: direct src import (dev)
      "require": "./dist/commonjs/src/*.js", // CommonJS: compiled dist
      "node": "./dist/nodenext/src/*.js", // Node: ESM variant
      "default": "./dist/nodenext/src/*.js"
    }
  },
  "dependencies": {
    "zod": "^4.1.13",
    "nestjs-zod": "^5.0.1"
  }
}
```

**Key**: Subpath exports (`./*`) allow `@repo/schemas/auth/auth.dto` imports.

### tsconfig.json (Primary - ESM)

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist/nodenext/",
    "rootDir": "./",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strictNullChecks": true
  },
  "include": ["src/**/*.ts"]
}
```

### tsconfig.cjs.json (Secondary - CommonJS)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "outDir": "./dist/commonjs"
  }
}
```

### package.json Scripts

```json
{
  "scripts": {
    "build": "tsc && tsc -p tsconfig.cjs.json", // Compile both ESM and CommonJS
    "dev": "concurrently \"tsc --watch\" \"tsc -p tsconfig.cjs.json --watch\""
  }
}
```

### Example: Auth Domain

**auth.ts** (Zod schemas — zero NestJS dependencies)

```typescript
import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().email("Invalid email format").trim(),
  password: z.string().min(8, "Password must be at least 8 characters").trim(),
});

export const registerInputSchema = z.object({
  name: z.string().min(1, "Name is required").trim().optional(),
  email: z.string().email("Invalid email format").trim(),
  password: z.string().min(8, "Password must be at least 8 characters").trim(),
});

export const loginOutputSchema = z.object({
  userId: z.string(),
  token: z.string(),
});
```

**auth.dto.ts** (NestJS DTOs derived from Zod)

```typescript
import { createZodDto } from "nestjs-zod";
import {
  loginInputSchema,
  loginOutputSchema,
  registerInputSchema,
} from "./auth";

export class LoginInputDto extends createZodDto(loginInputSchema) {}
export class LoginOutputDto extends createZodDto(loginOutputSchema) {}
export class RegisterInputDto extends createZodDto(registerInputSchema) {}
```

**In API Usage**:

```typescript
@Post('login')
async login(@Body() dto: LoginInputDto) {  // DTO automatically validates via Zod
  // dto is type-safe and validated
}
```

---

## **3. `@repo/data` Package**

**Purpose**: Types, Appwrite services, LLM configs, and utilities.

### Structure

```
packages/data/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts            # Barrel export (main entry point)
    ├── types/
    │   └── index.ts        # All TypeScript interfaces
    ├── services/
    │   ├── base.ts         # BaseService abstract class
    │   ├── chat-service.ts
    │   ├── message-service.ts
    │   ├── file-service.ts
    │   └── ... (15+ services)
    ├── appwrite.ts         # Appwrite SDK client factories
    ├── config.ts
    ├── llm-configs/
    │   ├── llm-config.ts
    │   ├── llm-prices.ts
    │   └── tool-prices.ts
    └── utils/
        └── utils.ts
```

### package.json

```json
{
  "name": "@repo/data",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "dependencies": {
    "appwrite": "^21.5.0",
    "qrcode": "^1.5.4"
  }
}
```

**Key**: Single export point (no subpath exports) — all exports re-exported from index.ts.

### tsconfig.json (Pure ESM)

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "src",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strictNullChecks": true
  },
  "include": ["src"]
}
```

### index.ts (Barrel Export Pattern)

```typescript
// Export Appwrite factories
export {
  getAccount,
  getClient,
  getRealtime,
  getStorage,
  getTables,
} from "./appwrite.js";

// Export service classes
export { ChatService } from "./services/chat-service.js";
export { MessageService } from "./services/message-service.js";
// ... export 15+ more services

// Export types
export type {
  ChatType,
  MessageType,
  FileType,
  TaskType,
  // ... export 30+ types
} from "./types/index.js";

// Export utilities
export { createQRCodeSVGDataUri, formatStorage } from "./utils/utils.js";

// Export configurations
export { modelsConfig } from "./llm-configs/llm-config.js";
export { modelsPrices, isFreeModel } from "./llm-configs/llm-prices.js";
```

**Usage**:

```typescript
// Web
import type { MessageType, ChatType } from "@repo/data";
import { createQRCodeSVGDataUri, modelsPrices } from "@repo/data";

// API
import { ChatService, MessageService } from "@repo/data";
import type { JobStatus } from "@repo/data";
```

---

## **4. `@repo/typescript-config` Package**

Shared TypeScript base — all packages extend from this.

### base.json

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noUncheckedIndexedAccess": true,
    "strict": true,
    "target": "ES2022"
  }
}
```

**Variants**:

- base.json — General/packages
- `nextjs.json` — Next.js apps
- `react-library.json` — React libraries

---

## **5. How Apps Consume Packages**

### In package.json (web, api, etc.)

```json
{
  "dependencies": {
    "@repo/data": "workspace:*",
    "@repo/schemas": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@repo/ui": "workspace:*"
  }
}
```

**`workspace:*`** means:

- Use local workspace version (no semver resolution)
- Changes immediately reflect in dev mode
- Turbo watches for rebuilds

### In TypeScript Files

**✅ CORRECT** (from package root):

```typescript
import { ChatService } from "@repo/data";
import type { MessageType } from "@repo/data";
import { LoginInputDto } from "@repo/schemas/auth/auth.dto";
import { Button, Card } from "@repo/ui";
```

**❌ WRONG** (from src subdirs):

```typescript
import { ChatService } from "@repo/data/src/services/chat-service"; // WRONG
```

Why: Respects dual ESM/CommonJS builds and package boundaries.

---

## **6. Development Workflow**

### Install

```bash
pnpm install
```

### Watch All

```bash
pnpm dev  # Turbo watches packages + apps
```

Packages compile first, then apps rebuild when they change.

### Watch Specific Package

```bash
cd packages/schemas
pnpm dev
```

### Build All

```bash
pnpm build  # Turbo respects dependency order
```

### Adding New Types

1. Add to index.ts
2. Export in index.ts
3. Rebuild: `pnpm build` or let watch compile
4. Import: `import type { NewType } from '@repo/data'`

### Adding New Schema

1. Create `packages/schemas/src/{domain}/{domain}.ts` (Zod)
2. Create `packages/schemas/src/{domain}/{domain}.dto.ts` (NestJS wrapper)
3. Both auto-compile in watch mode
4. Import: `import { DtoName } from '@repo/schemas/{domain}/{domain}.dto'`

---

## **7. Key Takeaways for Your Project**

| Component             | Location          | Purpose                  | Build                 |
| --------------------- | ----------------- | ------------------------ | --------------------- |
| **Schemas**           | schemas           | Zod + NestJS DTOs        | Dual (ESM + CommonJS) |
| **Data/Types**        | data              | Types, services, configs | ESM only              |
| **TypeScript Config** | typescript-config | Shared TS settings       | No build needed       |
| **UI Components**     | ui                | React components         | Source-served (dev)   |

**Critical constraints**:

- Use `workspace:*` in app package.jsons
- Extend shared TypeScript config
- Never import from src subdirs in packages
- Build packages before apps (Turbo enforces)
- Keep Zod schemas free of framework dependencies

This setup ensures type safety, single source of truth, and DRY code across the entire monorepo! 🎯
