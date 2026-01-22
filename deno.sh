#!/usr/bin/env bash

set -euo pipefail

DENO_VERSION="2.6.5"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
BIN_DIR="$ROOT_DIR/bin"

platform="$(uname | tr '[:upper:]' '[:lower:]')"
case "$platform" in
  darwin|linux) ;;
  *)
    echo "Unsupported platform: $platform" >&2
    exit 1
    ;;
esac

DENO_BIN="$BIN_DIR/$platform/deno"
VERSION_FILE="$BIN_DIR/deno.version"

needs_download=true
if [ -x "$DENO_BIN" ] && [ -f "$VERSION_FILE" ]; then
  if grep -qx "$DENO_VERSION" "$VERSION_FILE"; then
    needs_download=false
  fi
fi

download_file() {
  local url="$1"
  local output_file="$2"
  local platform_label="$3"
  local version="$4"
  local binary_name="$5"

  if [ ! -f "$output_file" ]; then
    echo "Downloading $binary_name for $platform_label from \"$url\"..."
    curl -fSL -# -o "$output_file" "$url"
  else
    echo "$binary_name for $platform_label (version $version) already exists. Skipping download."
  fi
}

process_file() {
  local input_file="$1"
  local output_dir="$2"
  local binary_name="$3"

  case "${input_file##*.}" in
    zip)
      unzip -q "$input_file" -d "$output_dir"
      ;;
    tgz | gz | xz)
      tar -xf "$input_file" -C "$output_dir"
      ;;
    *)
      cp "$input_file" "$output_dir/$binary_name"
      ;;
  esac

  if [ -d "$output_dir"/*/ ]; then
    mv "$output_dir"/*/ "$output_dir/$binary_name"
  fi

  chmod +x "$output_dir/$binary_name"
}

get_deno() {
  local platform_label="$1"
  local arch
  if [ "$platform_label" = "darwin" ]; then
    arch="aarch64-apple-darwin"
  else
    arch="x86_64-unknown-linux-gnu"
  fi

  local download_dir="$BIN_DIR/download"
  local platform_dir="$BIN_DIR/$platform_label"
  mkdir -p "$download_dir"
  rm -rf "$platform_dir"
  mkdir -p "$platform_dir"

  local url="https://github.com/denoland/deno/releases/download/v$DENO_VERSION/deno-$arch.zip"
  local download_file="$download_dir/deno_${platform_label}_v${DENO_VERSION}.zip"

  download_file "$url" "$download_file" "$platform_label" "$DENO_VERSION" "deno"
  process_file "$download_file" "$platform_dir" "deno"
  printf '%s\n' "$DENO_VERSION" > "$VERSION_FILE"
}

if [ "$needs_download" = true ]; then
  get_deno "$platform"
fi

if [ ! -x "$DENO_BIN" ]; then
  echo "Local Deno binary not found at $DENO_BIN" >&2
  exit 1
fi

export DENO_DIR="$BIN_DIR/deno_cache"
export DENO_INSTALL="$BIN_DIR/deno_install"
export PATH="$BIN_DIR/$platform:$DENO_INSTALL/bin:$PATH"

exec "$DENO_BIN" "$@"
