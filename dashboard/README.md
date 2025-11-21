fqBuHere is a comprehensive `README.md` based on the provided source code.

-----

# Spätify Admin Dashboard

[cite\_start]A modern, responsive administrative dashboard built with **Next.js 16** and **React 19** for managing "Späti" locations and amenities[cite: 1, 100, 561]. This application serves as the frontend interface for administrators to curate content for the Spatify platform.

## 🏗 Architecture

This project utilizes a **Client-Side Rendering (CSR)** strategy within the Next.js App Router structure. [cite\_start]It relies heavily on **TanStack Query** for server-state management, ensuring the UI stays in sync with the backend asynchronously[cite: 42, 150].

### Key Architectural Decisions:

  * [cite\_start]**Type Safety:** The project uses `openapi-typescript` to generate TypeScript definitions directly from the backend OpenAPI specification, ensuring strict type safety between the API and the frontend[cite: 453, 1279].
  * [cite\_start]**Component Library:** The UI is built using a "headless" approach with **Radix UI** primitives for accessibility and logic, styled via **Tailwind CSS v4** and **shadcn/ui** patterns[cite: 14, 236, 559].
  * **Authentication:** Implements a Bearer token authentication flow. [cite\_start]Tokens are stored in `localStorage` and automatically injected into API requests via a custom fetch wrapper[cite: 525, 541].
  * [cite\_start]**Form Management:** Forms are handled using **React Hook Form** paired with **Zod** schemas for validation[cite: 547, 119].

-----

## 📂 Project Structure

[cite\_start]The project follows a modular directory structure within the `dashboard` root[cite: 1]:

```txt
dashboard/
├── app/                 # Next.js App Router pages and layouts
[cite_start]│   ├── layout.tsx       # Root layout with fonts and Toaster [cite: 37]
[cite_start]│   └── page.tsx         # Entry point, renders SpatiAdminPage [cite: 39]
├── components/          # React components
[cite_start]│   ├── spatis/          # Domain-specific components (Dashboard, Login, Sections) [cite: 41]
[cite_start]│   └── ui/              # Reusable UI components (Buttons, Inputs, Dialogs) [cite: 47]
├── generated/           # Auto-generated API TypeScript definitions
[cite_start]│   └── api-types.ts     # OpenAPI interfaces [cite: 453]
├── lib/                 # Utilities and Logic
[cite_start]│   ├── api/             # API client and endpoint definitions [cite: 516, 536]
[cite_start]│   ├── auth/            # Token storage and management [cite: 539]
[cite_start]│   ├── validations/     # Zod schemas for form validation [cite: 547]
[cite_start]│   └── utils.ts         # Classname merging utility [cite: 546]
[cite_start]├── public/              # Static assets (SVGs) [cite: 1271]
├── scripts/             # Build/Maintenance scripts
[cite_start]│   └── generate-api-types.mjs # Script to sync types with backend [cite: 1275]
[cite_start]└── Dockerfile           # Multi-stage Docker build configuration [cite: 5]
```

-----

## 🚀 Features

  * [cite\_start]**Admin Authentication:** Secure login interface interacting with `/admin/auth/login`[cite: 494].
  * **Location Management:**
      * [cite\_start]View a paginated/filterable list of Spätis[cite: 162].
      * [cite\_start]Create, Update, and Delete locations [cite: 154-157].
      * [cite\_start]Manage details including geolocation, opening hours, and ratings [cite: 201-208].
  * **Amenity Management:**
      * [cite\_start]Maintain a catalog of amenities (e.g., WiFi, Seating)[cite: 66].
      * [cite\_start]Associate amenities with specific Späti locations[cite: 212].
  * [cite\_start]**Responsive UI:** Sidebar navigation that adapts to mobile and desktop viewports[cite: 98].
  * [cite\_start]**Dark Mode:** Built-in support via CSS variables and Tailwind[cite: 25].

-----

## 🛠 Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 | [cite\_start]App Router architecture [cite: 561] |
| **Library** | React 19 | [cite\_start]UI Component library [cite: 561] |
| **Language** | TypeScript 5 | [cite\_start]Static typing [cite: 562] |
| **Styling** | Tailwind CSS 4 | [cite\_start]Utility-first CSS [cite: 562] |
| **State** | TanStack Query v5 | [cite\_start]Async state management [cite: 560] |
| **Forms** | React Hook Form | [cite\_start]Form state management [cite: 561] |
| **Validation** | Zod | [cite\_start]Schema validation [cite: 1264] |
| **Icons** | Lucide React | [cite\_start]Iconography [cite: 560] |
| **Build** | Docker | [cite\_start]Containerization [cite: 5] |

-----

## 💻 Getting Started

### Prerequisites

  * Node.js (v20+ recommended)
  * npm or yarn

### 1\. Installation

Clone the repository and install dependencies:

```bash
cd dashboard
npm install
```

### 2\. Environment Variables

Create a `.env.local` file in the root directory. The application relies on the following variables for API connections:

```env
# Base URL for the backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333

# URL to fetch the OpenAPI spec for type generation
OPENAPI_SPEC_URL=http://localhost:3333/docs/json
```

*[Derived from cite: 522, 1277]*

### 3\. Generate API Types

If the backend API has changed, regenerate the TypeScript interfaces to ensure type safety:

```bash
npm run generate:api-types
```

*[See cite: 1279]*

### 4\. Run Development Server

```bash
npm run dev
```

[cite\_start]Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result[cite: 7].

-----

## 🐳 Docker Support

[cite\_start]The project includes a multi-stage `Dockerfile` optimized for production[cite: 5].

**Build the image:**

```bash
docker build -t spati-dashboard .
```

**Run the container:**

```bash
docker run -p 3000:3000 spati-dashboard
```

[cite\_start]The Dockerfile uses `node:20-alpine` and respects `NEXT_TELEMETRY_DISABLED=1` for privacy[cite: 5].

-----

## 🧩 Key Components

### API Client (`lib/api/client.ts`)

A wrapper around the native `fetch` API. It automatically handles:

  * [cite\_start]**Authorization:** Injects the `Bearer` token from local storage if present[cite: 525].
  * [cite\_start]**Headers:** Sets `Content-Type` and `Accept` headers[cite: 524].
  * [cite\_start]**Error Handling:** Throws errors for non-OK responses[cite: 527].

### Admin Content (`components/spatis/admin-content.tsx`)

[cite\_start]The main layout controller that switches between the `LoginView` and the `Dashboard` based on the presence of an authentication token[cite: 44].

### Validation Schemas (`lib/validations/admin.ts`)

Defines the shape and constraints of data using Zod. [cite\_start]For example, the `adminSpatiLocationSchema` ensures coordinates are numbers and names are non-empty strings[cite: 552].

-----

**Next Steps:**
Would you like me to create a detailed breakdown of the `lib/api` folder to help you understand how the data fetching layer is constructed?