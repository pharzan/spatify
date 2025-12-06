# Spätify App 🍻🗺️

A React Native application built with **Expo** that helps users locate "Spätis" (late-night convenience stores popular in Berlin) on an interactive, location-aware map.

## 🌟 Features

  * **Interactive Map:** `react-native-maps` renders stylized Google maps focused on Berlin.
  * **Geolocation:** The `useUserLocation` hook wraps `expo-location` to request permission and read the device position.
  * **Search & Discovery:** A searchable overlay lets users quickly jump to any Späti returned by the backend. Now supports **Amenity Icons** and **Mood Filters** for better discovery.
  * **Location Details:** Selecting a marker shows a rich `SpatiCard` with star ratings, hours, address, and distance from the user.
  * **Video Splash Screen:** A custom splash screen powered by `expo-video` for a premium startup experience.
  * **Data Management:** `@tanstack/react-query` powers hooks like `useSpatiQuery`, `useAmenitiesQuery`, and `useMoodsQuery` for cached API access.

## 🏗️ Tech Stack

  * **Framework:** [Expo](https://expo.dev/) (managed workflow)
  * **Library:** [React Native](https://reactnative.dev/)
  * **Language:** TypeScript
  * **State/Data:** React Query (TanStack Query)
  * **Maps:** Google Maps via `react-native-maps`
  * **Media:** `expo-video`, `expo-image`
  * **Tooling:** `openapi-typescript` for generating API types

## 📂 Project Structure

UI, hooks, and constants live under `src/` while generated API typings and scripts remain at the root:

```txt
app/
├── App.tsx                  # Minimal entry that renders <SpatiMap />
├── app.config.js            # Expo config + Google Maps key injection
├── index.ts                 # Registers the root component
├── generated/
│   └── api-types.ts         # OpenAPI generated types
├── scripts/
│   ├── configure-android-signing.mjs
│   └── generate-api-types.mjs
└── src/
    ├── components/
    │   ├── Map/
    │   │   ├── SpatiMarker.tsx
    │   │   └── UserLocationButton.tsx
    │   └── UI/
    │       ├── SearchBar.tsx
    │       ├── SpatiCard.tsx
    │       ├── SplashScreen.tsx
    │       └── StarRating.tsx
    ├── constants/mapStyle.ts
    └── hooks/
        ├── useAmenitiesQuery.ts
        ├── useMoodsQuery.ts
        ├── useSpatiQuery.ts
        └── useUserLocation.ts
```

## 🧱 Architecture

1. **Entry Point:** `index.ts` registers `App.tsx`, which wraps the map screen in a `QueryClientProvider`.
2. **Presentation:** `SpatiMap` (inside `App.tsx`) composes the map, overlays, and card. All UI widgets live in `src/components`.
3. **Hooks:** Custom hooks (`useSpatiQuery`, `useAmenitiesQuery`, etc.) handle networking + typing, while `useUserLocation` encapsulates permissions and geolocation side effects.
4. **Constants:** `GOOGLE_MAP_STYLE` contains the single map-style definition.

This keeps `App.tsx` declarative and easy to scan while every concern (API, location, UI pieces) lives in its own module.

## 🚀 Getting Started

### Prerequisites

  * Node.js (LTS recommended)
  * [Expo Go](https://expo.dev/client) on a device, or an Android/iOS simulator.

### Installation

```bash
git clone <repository-url>
cd app
npm install
```

### Environment Configuration

Create a `.env` file (or export the variables) containing:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_API_BASE_URL=https://your-api.example.com
```

Both variables are forward-declared as Expo “public” vars and are read automatically by Metro and `app.config.js`.

### Running the App

```bash
npm run dev      # start Expo
npm run android  # build & install on Android
npm run ios      # build & install on iOS
npm run web      # run web preview
```

## 🛠️ Scripts & Tooling

| Command | Description |
| :--- | :--- |
| `npm run generate:api-types` | Calls the OpenAPI generator script and refreshes TypeScript interfaces. |
| `npm run setup:android-signing` | Helper for injecting keystore data (primarily CI). |

## 🔑 Key Configuration Files

  * **`app.config.js`** – Uses the `.env` values to configure map API keys and native identifiers. It also configures plugins like `expo-video`.
  * **`eas.json`** – Profiles for building with Expo Application Services.

-----

Happy mapping! Feel free to extend the hooks/components pattern with new overlays or filters as the product grows.

### Build

first create a keystore file.

1. npx expo prebuild
2. npx expo run:android
3. npm run setup:android-signing -- --store-file my-release-key.keystore --store-password 123456 --key-alias spatifyRelease --key-password 123456
4. cd android && NODE_ENV=production ./gradlew assembleRelease
5. open app/build/outputs/apk/release/ && cd ..

