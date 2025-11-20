# Spatify API

The **Spatify API** is a Node.js backend service designed to manage and serve information about "Späti" locations (convenience stores). It is built using **Fastify**, **TypeScript**, and **Drizzle ORM** with a **PostgreSQL** database.

The project utilizes a layered architecture, ensuring separation of concerns between HTTP handling, business logic, and database access. It also features first-class OpenAPI (Swagger) documentation generated automatically from Zod schemas.

## 🛠 Tech Stack

  * **Runtime:** Node.js (ES Modules)
  * **Framework:** [Fastify](https://www.fastify.io/) (v5)
  * **Language:** TypeScript
  * **Database:** PostgreSQL
  * **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
  * **Validation:** [Zod](https://zod.dev/)
  * **API Docs:** [Fastify Zod OpenAPI](https://github.com/samchungy/zod-openapi) (Swagger UI)
  * **Tooling:** `tsx` for development, `make` for workflow automation.

## 📂 Project Structure & Architecture

The project follows a **Layered Architecture** (Controller-Service-Repository pattern) to maintain clean code and testability.

```text
src
├── config/          # Environment configuration (dotenv wrapper)
├── db/              # Database connection and Drizzle schema definitions
├── models/          # Type definitions
│   ├── api.ts       # Zod schemas for HTTP Request/Response validation
│   ├── db.ts        # Drizzle inferred types for Database records
│   └── mappers.ts   # Functions to transform DB records into API responses
├── plugins/         # Fastify plugins (Swagger configuration)
├── repositories/    # Data Access Layer (Direct DB interactions)
├── routes/          # HTTP Layer (Controllers, input parsing, route definitions)
├── services/        # Business Logic Layer
├── utils/           # Helper functions (Schema registration)
└── server.ts        # Application entry point
```

### Architectural Layers

1.  **Routes (`src/routes`)**:

      * The entry point for HTTP requests.
      * Defines endpoints (e.g., `/spatis`, `/admin/spatis`).
      * Uses **Zod** schemas to validate headers, params, and body *before* execution.
      * Calls the **Service** layer.
      * *Key files:* `spatiRoutes.ts` (Public), `adminSpatiRoutes.ts` (Protected).

2.  **Services (`src/services`)**:

      * Contains the business logic.
      * Handles data transformation and error throwing (e.g., `SpatiNotFoundError`).
      * Agnostic of the HTTP transport layer (doesn't know about `req` or `res`).
      * Calls the **Repository** layer.

3.  **Repositories (`src/repositories`)**:

      * The only layer that interacts directly with the Database.
      * Uses **Drizzle ORM** to execute SQL queries.
      * Returns raw database records.

4.  **Models & Mappers (`src/models`)**:

      * **Strict Separation:** The API models (what the user sees) are decoupled from the DB models (how data is stored).
      * **Mappers:** Explicit functions convert DB records (snake\_case) to API objects (camelCase).

## 🚀 Getting Started

### Prerequisites

  * **Node.js** (v20+ recommended)
  * **Docker** (For running the local PostgreSQL database)
  * **npm**

### 1\. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2\. Environment Setup

Create a `.env` file based on the example:

```bash
cp .env.example .env
```

### 3\. Database Setup

The project includes a helper script (`dev-db.sh`) wrapped in a Makefile to spin up a PostgreSQL container.

Start the database:

```bash
make db-up
```

Run the migrations to create the tables:

```bash
make db-migrate
```

### 4\. Running the Server

Start the development server (uses `tsx` for hot-reloading):

```bash
make run
# OR
npm run dev
```

The API will run at `http://0.0.0.0:3333` (or the port defined in `.env`).

## 📖 API Documentation

The project auto-generates OpenAPI v3 documentation.

  * **Swagger UI:** Visit `http://localhost:3333/docs` to view endpoints and test the API interactively.
  * **JSON Spec:** Available at `http://localhost:3333/docs/json-app`.

*Note: The Swagger configuration includes a filter to hide specific Admin routes or tags depending on the configuration in `src/plugins/swagger.ts`.*

## 🧰 Development Commands

The project uses a `Makefile` to simplify common tasks:

| Command | Description |
| :--- | :--- |
| `make run` | Starts the dev server. |
| `make build` | Compiles TypeScript to JavaScript (`/dist`). |
| `make db-up` | Starts the Docker PostgreSQL container. |
| `make db-down` | Stops and removes the Docker container. |
| `make db-migrate` | Pushes schema changes to the DB (Drizzle Push). |
| `make db-generate`| Generates SQL migration files based on schema changes. |
| `make db-studio` | Opens Drizzle Studio in the browser to view data. |

## 📦 Database Schema

The core entity is `spati_locations`, defined in `src/db/schema.ts`.

```sql
CREATE TABLE "spati_locations" (
  "id" text PRIMARY KEY,
  "store_name" text NOT NULL,
  "description" text NOT NULL,
  "lat" double precision NOT NULL,
  "lng" double precision NOT NULL,
  "address" text NOT NULL,
  "opening_hours" text NOT NULL,
  "store_type" text NOT NULL,
  "rating" double precision NOT NULL
);
```

## 🔒 Security & Validation

  * **Input Validation:** All incoming data is validated against Zod schemas. If the input is invalid, Fastify automatically returns a 400 Bad Request.
  * **Type Safety:** TypeScript ensures that the data flowing from the DB -\> Repository -\> Service -\> API matches the expected types.