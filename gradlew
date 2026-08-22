#!/usr/bin/env bash
# Bootstrap the Android project stored in the repository's source archive, then
# delegate all arguments to its real Gradle wrapper. This keeps the root-level
# GitHub Actions workflow working even though the Android project is nested.
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ARCHIVE="$ROOT_DIR/redgifs-downloader-android-v1.1.21.zip"
SOURCE_DIR="$ROOT_DIR/redgifs-downloader-android-v1.1.21"
MOBILE_DIR="$SOURCE_DIR/mobile"
ANDROID_DIR="$MOBILE_DIR/android"

if [[ ! -f "$ARCHIVE" ]]; then
  echo "Error: source archive not found: $ARCHIVE" >&2
  exit 1
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Extracting RedLoader source archive..."
  unzip -q "$ARCHIVE" -d "$ROOT_DIR"
fi

if [[ ! -f "$MOBILE_DIR/package-lock.json" || ! -f "$ANDROID_DIR/gradlew" ]]; then
  echo "Error: Android project is missing or the archive layout is invalid." >&2
  exit 1
fi

command -v node >/dev/null || { echo "Error: Node.js is required." >&2; exit 1; }
command -v npm >/dev/null || { echo "Error: npm is required." >&2; exit 1; }

cd "$MOBILE_DIR"
echo "Installing mobile dependencies..."
npm ci

echo "Building web assets and syncing the Android project..."
npm run build
npx --no-install cap sync android

cd "$ANDROID_DIR"
chmod +x gradlew
echo "Running Android Gradle wrapper: $*"
exec ./gradlew "$@"
