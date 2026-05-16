#!/bin/bash

# TODO make this better

# Configuration
WATCH_DIR="./the_funny_way/go_boid_stuff/"  # Directory to monitor (relative or absolute path)
BUILD_CMD="go build -C ./the_funny_way/go_boid_stuff/ -o ../dist/boid.wasm"  # Your build command here
# BUILD_CMD="GOOS=js GOARCH=wasm go build -o ./boid.wasm"  # Your build command here
# BUILD_CMD="echo what"  # Your build command here

# Monitor for file changes and trigger build
echo "Watching for changes in: $WATCH_DIR"
echo "Build command: $BUILD_CMD"
echo "Press Ctrl+C to stop..."

# run once at startup
GOOS=js GOARCH=wasm $BUILD_CMD

inotifywait -m -r -e modify,create,delete,move "$WATCH_DIR" |
while read line; do
    echo "--- Changes detected! Running build... ---"
    GOOS=js GOARCH=wasm $BUILD_CMD
    echo "--- Build completed at $(date) ---"
done