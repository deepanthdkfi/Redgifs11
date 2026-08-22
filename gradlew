#!/usr/bin/env bash
# SoulX Browser Root Gradle Wrapper
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ANDROID_DIR="$ROOT_DIR/android"

# Sync latest index.html to Android assets
mkdir -p "$ANDROID_DIR/app/src/main/assets/public"
cp -f "$ROOT_DIR/index.html" "$ANDROID_DIR/app/src/main/assets/public/index.html"

cd "$ANDROID_DIR"
chmod +x gradlew
echo "⚡ Building SoulX Browser APK via Gradle: $*"
exec ./gradlew "$@"
