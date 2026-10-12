#!/bin/sh
set -eu

IMAGE_TAG="${IMAGE_TAG:-}"
APP_CONTAINER="${APP_CONTAINER:-}"
CHECK_CONTAINER="${CHECK_CONTAINER:-}"

if [ -n "$APP_CONTAINER" ]; then
  docker rm -f "$APP_CONTAINER" 2>/dev/null || true
fi

if [ -n "$CHECK_CONTAINER" ]; then
  docker rm -f "$CHECK_CONTAINER" 2>/dev/null || true
fi

if [ -n "$IMAGE_TAG" ]; then
  docker image rm "$IMAGE_TAG" 2>/dev/null || true
fi

echo "Cleanup finished for requested kurau.wav test resources only."
