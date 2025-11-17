# Repository Guidelines

## Project Structure & Module Organization
This Expo-managed React Native app keeps everything at the root: `App.tsx` hosts the map UI and interactions, `index.ts` registers the entry component, and `data.ts` centralizes typed mock locations. Static images live in `assets/`, with runtime settings (name, splash, permissions) in `app.json` and TypeScript config in `tsconfig.json`. Keep new screens close to their consumers—create folders such as `screens/Filters/FiltersScreen.tsx` instead of growing `App.tsx`.

## Build, Test, and Development Commands
- `npm run dev` – launches `expo start` for whichever client connects first.
- `npm run ios` / `npm run android` – opens Expo Go in the respective simulator for platform-specific checks.
- `npm run web` – serves the web preview, useful for quick layout validations.
Install dependencies with `npm install` before running any command; Expo CLI version should match SDK 54 to prevent warnings.

## Coding Style & Naming Conventions
Use TypeScript everywhere and prefer functional components with hooks. Match the current two-space indentation, trailing commas, and separate JSX props per line. Name component files in PascalCase (`NearbySheet.tsx`), data helpers in camelCase, and keep style objects inside `StyleSheet.create` near their component. Use double quotes in JSX, single quotes elsewhere, and rely on editor-format-on-save to keep files consistent until linting is added.

## Testing Guidelines
Automated tests have not been added yet; introduce them with `jest-expo` plus `@testing-library/react-native`. Name files `ComponentName.test.tsx` and keep them beside the implementation or under a focused `__tests__/` folder. Target 80% line coverage for new UI logic and include integration tests for geolocation flows (permissions, routing polyline). After configuring Jest, expose it through `npm test` so CI can call `npx jest --runInBand`.

## Commit & Pull Request Guidelines
The current history (`Initial commit`) uses the conventional short, imperative subject format—continue that pattern (e.g., `Add realtime location pulse`). Reference issues in the body and enumerate user-visible changes with bullets. Pull requests must include a concise summary, screenshots or short recordings for UI changes, device/OS combinations tested, and any follow-up tasks. Rebase on `main` before requesting review.

## Security & Configuration Tips
Never commit real API keys; move the `GOOGLE_MAPS_API_KEY` into Expo config (`app.config.js` + `process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`) and load it via `Constants`. Keep environment files (`.env.*`) ignored by Git and document required variables in `README` updates. When debugging location services, prefer mocking coordinates through `mockLocations` rather than hard-coding personal data.
