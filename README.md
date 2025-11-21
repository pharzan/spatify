# Spatify Monorepo

Spatify is a full-stack platform for discovering and curating "Spätis"—Berlin's late-night convenience stores. This repository houses apps that work together: a Fastify-powered API, an Expo mobile app, and a Next.js admin dashboard. Each package is self-contained but shares the same product vocabulary, data contracts, and OpenAPI spec.

## Repository Layout

| Path | Description |
| :--- | :--- |
| `api/` | Node.js + Fastify backend with a layered architecture, PostgreSQL + Drizzle ORM, and OpenAPI docs. |
| `app/` | Expo (React Native) consumer app that renders the Späti map experience. |
| `dashboard/` | Next.js admin dashboard for managing Späti locations and amenities. |

> Each package keeps its own `README.md` with exhaustive details. This document highlights how they fit together and the high-level workflows.

## Getting Started

1. Install system dependencies:
   - Node.js 20+
   - npm (or your preferred package manager)
   - Docker (required for the API's local PostgreSQL database)
2. Clone the repo and install dependencies per package:

   ```bash
   git clone <repo>
   cd spatify
   npm install --prefix api
   npm install --prefix app
   npm install --prefix dashboard
   ```

3. Generate API typings wherever they're consumed (dashboard/app) after the backend schema changes:

   ```bash
   npm run generate:api-types --prefix dashboard
   npm run generate:api-types --prefix app
   ```

4. Start the desired project using the package-specific instructions below.

## API (`api/`)

- **Stack:** Fastify v5, TypeScript, Drizzle ORM, PostgreSQL, Zod validation, Swagger docs powered by `fastify-zod-openapi`.
- **Architecture:** Classic routes → services → repositories layering with strict model/mapping separation (`src/models/db.ts` vs `src/models/api.ts`). Swagger schemas are generated directly from Zod definitions.
- **Key Features:** Public `/spatis` endpoints, admin-protected routes, automatic OpenAPI spec at `/docs` + `/docs/json`, Makefile-driven workflow, and Dockerized PostgreSQL helper scripts.
- **Local Setup:**
  1. Copy `.env.example` to `.env` and adjust ports, database credentials, and Swagger toggles.
  2. Provision the dev database:

     ```bash
     make db-up
     make db-migrate
     ```

  3. Run the API:

     ```bash
     make run   # or npm run dev
     ```

- **Common Commands:** `make build`, `make db-generate`, `make db-studio`, `npm run lint`, `npm run format`.

## Mobile App (`app/`)

- **Stack:** Expo (managed workflow), React Native + TypeScript, React Query, `react-native-maps`, and Expo Location.
- **Highlights:** Interactive Google Map centered on Berlin, searchable overlay, marker details with hours/ratings/distance, hooks (`useSpatiQuery`, `useUserLocation`) encapsulating networking and geolocation concerns.
- **Structure:** Entry files (`App.tsx`, `index.ts`) wire up `SpatiMap` with a `QueryClientProvider`, components live in `src/components`, hooks in `src/hooks`, constants such as `GOOGLE_MAP_STYLE` under `src/constants`, and OpenAPI types are generated into `generated/api-types.ts`.
- **Local Setup:**
  1. Install dependencies via `npm install`.
  2. Create `.env` with:

     ```bash
     EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
     EXPO_PUBLIC_API_BASE_URL=https://api.example.com
     ```

  3. Start Expo:

     ```bash
     npm run dev      # Metro + Expo CLI
     npm run android  # optional native target
     npm run ios
     npm run web
     ```

- **Tooling:** `npm run generate:api-types` to refresh client typings, `npm run setup:android-signing` for EAS automation.

## Admin Dashboard (`dashboard/`)

- **Stack:** Next.js 16 App Router (client-rendered), React 19, TypeScript 5, Tailwind CSS v4 + shadcn/ui styling patterns, Radix UI primitives, TanStack Query v5, React Hook Form + Zod, Lucide icons.
- **Features:** Token-based admin auth, CRUD for Späti locations (with pagination/filtering) and amenities, responsive sidebar layout, dark mode toggles, and dockerized production build.
- **Structure:**
  - `app/` for layouts/pages (e.g., `layout.tsx`, `page.tsx`).
  - `components/spatis` for domain widgets and `components/ui` for primitives.
  - `lib/api` fetch wrapper auto-injects bearer tokens; `lib/auth` handles storage; `lib/validations` keeps shared Zod schemas.
  - `generated/api-types.ts` holds OpenAPI-derived contracts.
- **Local Setup:**
  1. Install dependencies and create `.env.local` with:

     ```env
     NEXT_PUBLIC_API_BASE_URL=http://localhost:3333
     OPENAPI_SPEC_URL=http://localhost:3333/docs/json
     ```

  2. Generate API types if the backend spec changed:

     ```bash
     npm run generate:api-types
     ```

  3. Start the dev server:

     ```bash
     npm run dev
     ```

- **Docker:** Build with `docker build -t spati-dashboard .` and run via `docker run -p 3000:3000 spati-dashboard`.

## Workflow Tips

- Favor the Makefile in `api/` for database lifecycle actions to avoid recreating docker commands.
- Keep the OpenAPI spec in sync: run the API and expose `/docs/json`, then execute the generator scripts in `app/` and `dashboard/`.
- Treat each package as isolated for linting/testing; CI typically runs `npm run lint`/`npm run test` inside each directory.

For deeper details (file-by-file breakdowns, architecture diagrams, etc.) refer to the package-specific README files.
