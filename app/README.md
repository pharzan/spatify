# Spätify App 🍻🗺️

A React Native application built with **Expo** designed to help users locate "Spätis" (late-night convenience stores, popular in Berlin) on an interactive map. The app provides geolocation services, routing, and detailed information about specific store locations.

## 🌟 Features

  * **Interactive Map:** Built using `react-native-maps` with custom styling.
  * **Geolocation:** Locates the user's current position using `expo-location`.
  * **Search & Discovery:** Filter locations by name or address.
  * **Routing:** Visualizes driving/walking routes from the user to a destination using `react-native-maps-directions`.
  * **Location Details:** View ratings, opening hours, and descriptions for specific shops.
  * **Data Management:** Uses `@tanstack/react-query` for efficient data fetching and caching.

## 🏗️ Tech Stack

  * **Framework:** [Expo](https://expo.dev/) (Managed Workflow)
  * **Library:** [React Native](https://reactnative.dev/)
  * **Language:** TypeScript
  * **State/Data:** React Query (TanStack Query)
  * **Maps:** Google Maps API via `react-native-maps`

## 📂 Project Structure

The project follows a lean structure where the primary UI logic resides in the root, supported by specific helper scripts and generated types.

```txt
app/
├── App.tsx                  # 📱 Main Application Entry & Monolithic UI Component
├── app.config.js            # ⚙️ Expo Runtime Configuration (Env vars, Maps Key)
├── data.ts                  # Mz Mock data for development/fallback
├── index.ts                 # qc Entry point (Registers Root Component)
├── assets/                  # 🖼️ Static assets (Icons, Splash screens)
├── scripts/                 # 🛠️ Node.js helper scripts
│   ├── configure-android-signing.mjs  # CI helper for Keystores
│   └── generate-api-types.mjs         # OpenAPI Type Generator
└── src/
    └── generated/
        └── api-types.ts     # TS Interfaces generated from OpenAPI spec
```

## 🧱 Architecture

The application architecture is currently **Single-View / Map-Centric**:

1.  **Entry Point:** `index.ts` registers `App.tsx` via `registerRootComponent`.
2.  **UI Layer (`App.tsx`):**
      * Manages map state (`latitude`, `longitude`, `deltas`).
      * Handles Location Permissions via `ExpoLocation`.
      * Renders overlays: Search Bar (Top) and Location Details Card (Bottom).
      * Animations: Uses `Animated` API for the user location pulse effect.
3.  **Data Layer:**
      * **Fetching:** Utilizes `useSpatisQuery` (custom hook wrapping React Query) to fetch location data.
      * **Types:** Strictly typed using TypeScript interfaces generated from an OpenAPI spec (`src/generated/api-types.ts`).
      * **Mock Data:** `data.ts` provides fallback static data for testing UI without a backend.
4.  **External Services:**
      * **Google Maps API:** Used for map tiles and the Directions API for routing lines.

## 🚀 Getting Started

### Prerequisites

  * Node.js (LTS recommended)
  * [Expo Go](https://www.google.com/search?q=https://expo.dev/client) app on your physical device, or an Android/iOS Emulator.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    You must provide a Google Maps API Key. Create a `.env` file (or export variables) containing:

    ```bash
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
    ```

### Running the App

  * **Start the development server:**
    ```bash
    npm run dev
    ```
  * **Run on Android Emulator:**
    ```bash
    npm run android
    ```
  * **Run on iOS Simulator:**
    ```bash
    npm run ios
    ```
  * **Run on Web:**
    ```bash
    npm run web
    ```

## 🛠️ Scripts & Tooling

The `package.json` includes custom utility scripts located in the `scripts/` folder:

| Command | Description |
| :--- | :--- |
| `npm run generate:api-types` | Fetches OpenAPI JSON from `localhost:3333` (default) and generates TypeScript interfaces into `src/generated/`. |
| `npm run setup:android-signing` | Inject Keystore credentials into `gradle.properties` (Used primarily in CI/CD environments). |

## 🔑 Key Configuration Files

  * **`app.config.js`**: Dynamic configuration that reads the Google Maps API key from environment variables and configures bundle identifiers for iOS and Android.
  * **`eas.json`**: Configuration for Expo Application Services (Build profiles for Development, Preview, and Production).
  * **`AGENTS.md`**: Contains specific coding guidelines and conventions for AI agents or developers working on this repo.

-----

### Next Steps for Development

  * **Refactoring:** `App.tsx` is currently large; components like `SpatiMap`, `BottomCard`, and `SearchBar` should be extracted into a `src/components/` directory.
  * **Testing:** No tests are currently implemented. Jest and React Native Testing Library should be set up.

-----

**Would you like me to extract the sub-components (Map, Card, Search) from `App.tsx` into separate files to improve the project structure?**