# Spätify Admin Dashboard
 A modern, responsive administrative dashboard built with **Next.js 16** and **React 19** for managing "Späti" locations and amenities. This application serves as the frontend interface for administrators to curate content for the Spatify platform.

## 🏗 Architecture

This project utilizes a **Client-Side Rendering (CSR)** strategy within the Next.js App Router structure. It relies heavily on **TanStack Query** for server-state management, ensuring the UI stays in sync with the backend asynchronously.

### Key Architectural Decisions:

  * **Type Safety:** The project uses `openapi-typescript` to generate TypeScript definitions directly from the backend OpenAPI specification, ensuring strict type safety between the API and the frontend.
  * **Component Library:** The UI is built using a "headless" approach with **Radix UI** primitives for accessibility and logic, styled via **Tailwind CSS v4** and **shadcn/ui** patterns.
  * **Authentication:** Implements a Bearer token authentication flow. Tokens are stored in `localStorage` and automatically injected into API requests via a custom fetch wrapper.
  * **Form Management:** Forms are handled using **React Hook Form** paired with **Zod** schemas for validation.

-----

## 📂 Project Structure
 The project follows a modular directory structure within the `dashboard` root:

```txt
dashboard/
├── app/                 # Next.js App Router pages and layouts
│   ├── layout.tsx       # Root layout with fonts and Toaster 
│   └── page.tsx         # Entry point, renders SpatiAdminPage 
├── components/          # React components
│   ├── spatis/          # Domain-specific components (Dashboard, Login, Sections) 
│   └── ui/              # Reusable UI components (Buttons, Inputs, Dialogs) 
├── generated/           # Auto-generated API TypeScript definitions
│   └── api-types.ts     # OpenAPI interfaces 
├── lib/                 # Utilities and Logic
│   ├── api/             # API client and endpoint definitions 
│   ├── auth/            # Token storage and management 
│   ├── validations/     # Zod schemas for form validation 
│   └── utils.ts         # Classname merging utility 
├── public/              # Static assets (SVGs) 
├── scripts/             # Build/Maintenance scripts
│   └── generate-api-types.mjs # Script to sync types with backend 
└── Dockerfile           # Multi-stage Docker build configuration 
```

-----

## 🚀 Features

  * **Admin Authentication:** Secure login interface interacting with `/admin/auth/login`.
  * **Location Management:**
      * View a paginated/filterable list of Spätis.
      * Create, Update, and Delete locations .
      * Manage details including geolocation, opening hours, and ratings .
  * **Amenity Management:**
      * Maintain a catalog of amenities (e.g., WiFi, Seating).
      * Associate amenities with specific Späti locations.
  * **Responsive UI:** Sidebar navigation that adapts to mobile and desktop viewports.
  * **Dark Mode:** Built-in support via CSS variables and Tailwind.

-----

## 🛠 Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 | App Router architecture  |
| **Library** | React 19 | UI Component library  |
| **Language** | TypeScript 5 | Static typing  |
| **Styling** | Tailwind CSS 4 | Utility-first CSS  |
| **State** | TanStack Query v5 | Async state management  |
| **Forms** | React Hook Form | Form state management  |
| **Validation** | Zod | Schema validation  |
| **Icons** | Lucide React | Iconography  |
| **Build** | Docker | Containerization  |

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
 Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

-----

## 🐳 Docker Support
 The project includes a multi-stage `Dockerfile` optimized for production.

**Build the image:**

```bash
docker build -t spati-dashboard .
```

**Run the container:**

```bash
docker run -p 3000:3000 spati-dashboard
```
 The Dockerfile uses `node:20-alpine` and respects `NEXT_TELEMETRY_DISABLED=1` for privacy.

-----

## 🧩 Key Components

### API Client (`lib/api/client.ts`)

A wrapper around the native `fetch` API. It automatically handles:

  * **Authorization:** Injects the `Bearer` token from local storage if present.
  * **Headers:** Sets `Content-Type` and `Accept` headers.
  * **Error Handling:** Throws errors for non-OK responses.

### Admin Content (`components/spatis/admin-content.tsx`)
 The main layout controller that switches between the `LoginView` and the `Dashboard` based on the presence of an authentication token.

### Validation Schemas (`lib/validations/admin.ts`)

Defines the shape and constraints of data using Zod. For example, the `adminSpatiLocationSchema` ensures coordinates are numbers and names are non-empty strings.

-----

**Next Steps:**
Would you like me to create a detailed breakdown of the `lib/api` folder to help you understand how the data fetching layer is constructed?