#!/bin/bash

# Exit script on any error
set -e

# Function to extract version from package.json
get_version() {
  node -p "require('./package.json').version"
}

VERSION=$(get_version)
TAG="v$VERSION"
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

echo "🚀 Starting Release Process for $TAG..."

# 2. Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ Error: APK not found at $APK_PATH"
    echo "Run ./build-android.sh first"
    exit 1
fi

echo "----------------------------------------------------------------"
echo "Creating GitHub Release..."
echo "----------------------------------------------------------------"

# Check if release already exists
if gh release view "$TAG" > /dev/null 2>&1; then
    echo "⚠️ Release $TAG already exists."
    read -p "Do you want to overwrite it? (y/N) " confirm
    if [[ "$confirm" != "y" ]]; then
        echo "Exiting..."
        exit 0
    fi
    # Delete existing release to re-create or just upload asset?
    # Let's just upload the asset to the existing release, maybe overwriting if clobber is supported or we have to delete asset first.
    # For simplicity, let's try to upload. calling 'gh release create' on existing tag might fail.
    # We will assume user wants to attach to existing or we warn.
    echo "Uploading to existing release..."
    gh release upload "$TAG" "$APK_PATH" --clobber
else
    echo "Creating new release $TAG..."
    # Create release (using title as tag)
    gh release create "$TAG" --title "Release $TAG" --notes "Automated release for version $VERSION" "$APK_PATH"
fi

echo "----------------------------------------------------------------"
echo "✅ Release Complete!"
echo "View your release at: $(gh release view "$TAG" --json url -q .url)"
echo "----------------------------------------------------------------"
