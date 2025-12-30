#!/bin/bash

# Exit script on any error
set -e

echo "🚀 Starting Android Build Process..."

echo "----------------------------------------------------------------"
echo "Step 0: Cleaning Expo Prebuild..."
echo "----------------------------------------------------------------"
npx expo prebuild --clean

echo "----------------------------------------------------------------"
echo "Step 1: Running Expo Prebuild..."
echo "----------------------------------------------------------------"
npx expo prebuild

echo "----------------------------------------------------------------"
echo "Step 2: Configuring Android Signing..."
echo "----------------------------------------------------------------"
npm run setup:android-signing -- --store-file my-release-key.keystore --store-password 123456 --key-alias spatifyRelease --key-password 123456

echo "----------------------------------------------------------------"
echo "Step 3: Building Native Android Project..."
echo "----------------------------------------------------------------"
cd android

echo "Running ./gradlew clean..."
./gradlew clean

echo "Running ./gradlew assembleRelease..."
# Ensure we use the .env from the app root
npx dotenv-cli -e ../.env -- ./gradlew assembleRelease

echo "----------------------------------------------------------------"
echo "✅ Build Complete!"
echo "----------------------------------------------------------------"

# Try to open the output folder in Windows Explorer
OUTPUT_PATH="app/build/outputs/apk/release/"
echo "Opening output folder: $OUTPUT_PATH"

if command -v explorer.exe &> /dev/null; then
    explorer.exe "$OUTPUT_PATH"
else
    echo "explorer.exe not found. Output apk is in: android/$OUTPUT_PATH"
fi
