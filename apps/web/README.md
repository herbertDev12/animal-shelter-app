
# How to add a route to the web application

In this project, routing is powered by **TanStack React Router** with **File-Based Routing** (configured via Vite). 

This means that the directory structure and file names inside **`apps/web/src/routes/`** directly determine the URL paths of your application, and code is automatically generated to provide full, end-to-end type safety.

Here is a step-by-step guide on how you can keep adding routes to your project.

---

### 1. Route File Naming Conventions
To create a route, you simply add a file under `apps/web/src/routes/` using one of these conventions:

| Route Type | File Path | Maps to URL |
| :--- | :--- | :--- |
| **Index (Home)** | `src/routes/index.tsx` | `/` |
| **Basic Route** | `src/routes/about.tsx` or `src/routes/contact.tsx` | `/about`, `/contact` |
| **Nested Folder Route** | `src/routes/blog/index.tsx` | `/blog` |
| **Dynamic Parameter** | `src/routes/animals/$animalId.tsx` | `/animals/:animalId` |
| **Catch-All (Splat)** | `src/routes/$.tsx` | `/any-other-path-not-matched` |

---

### 2. How to Add a New Route (Step-by-Step)

#### Step 1: Create the file
For example, let's say you want to add a `/shelters` page. Create a file at `apps/web/src/routes/shelters.tsx`.

#### Step 2: Write the Route Definition
In your new file, export a `Route` constant created with `createFileRoute`. The argument to `createFileRoute` must match the file path relative to the routes folder (the compiler will generate an error if there is a mismatch, preventing typos).

**Example for a Basic Route (`src/routes/shelters.tsx`):**
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shelters')({
  component: SheltersComponent,
})

function SheltersComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Our Animal Shelters</h1>
      <p>Here is a list of shelter locations...</p>
    </div>
  )
}
```

**Example for a Dynamic Route (`src/routes/animals/$animalId.tsx`):**
If you need dynamic routing (e.g. showing detail pages for animals), you define it using the `$` prefix:
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/animals/$animalId')({
  component: AnimalDetailComponent,
})

function AnimalDetailComponent() {
  // Retrieve the parameter in a typesafe way!
  const { animalId } = Route.useParams()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Animal Profile</h1>
      <p>Viewing details for Animal ID: <strong className="text-amber-600">{animalId}</strong></p>
    </div>
  )
}
```

---

### 3. Let the Code Generator Run
When your development server is running:
* TanStack Router will automatically watch the `src/routes/` folder.
* It will immediately generate/update **`apps/web/src/routeTree.gen.ts`**.
* *Tip:* If the compiler doesn't pick up the changes automatically, simply run `npm run dev` in your terminal again.

---

### 4. Linking to Your New Route
To navigate to your new route, import the `<Link>` component from `@tanstack/react-router` and use it. Thanks to TanStack's type safety, you'll get autocomplete and build-time checks on the `to` prop!

```tsx
import { Link } from '@tanstack/react-router'

function Navigation() {
  return (
    <nav className="flex gap-4 p-4 bg-gray-100">
      {/* Autocomplete will suggest these paths */}
      <Link to="/" activeProps={{ className: 'font-bold' }}>
        Home
      </Link>
      
      <Link to="/about" activeProps={{ className: 'font-bold' }}>
        About
      </Link>
      
      <Link to="/shelters" activeProps={{ className: 'font-bold' }}>
        Shelters
      </Link>

      {/* For dynamic routes, you must provide the params object! */}
      <Link 
        to="/animals/$animalId" 
        params={{ animalId: '123' }}
        activeProps={{ className: 'font-bold' }}
      >
        View Animal 123
      </Link>
    </nav>
  )
}
```