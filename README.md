# Deno Starter

Self-contained Deno + TypeScript starter project. No global installs required.

## Quick start

```sh
./deno.sh task dev
```

Then open `http://localhost:8000`.

## Customize

Change the app name in `src/constants.ts`:

```ts
export const APP_NAME = "your-app-name";
```

This updates the page title, overlay text, and compiled binary names.

## Commands

```sh
./deno.sh task dev     # dev server (auto-reload)
./deno.sh task start   # production server
./deno.sh task dist    # build static site into ./dist/site
./deno.sh task compile # build binaries into ./dist/bin/<target>/
./deno.sh task check   # typecheck + lint
./deno.sh task test    # run tests
./deno.sh task fmt     # format code
./deno.sh task clean   # clean caches/builds
```

## How it works

- `deno.sh` auto-downloads Deno to `bin/` on first run (no global install needed)
- `src/server.ts` bundles `src/client.ts` and serves it with live reload
- `src/build.ts` creates a static site in `dist/site/` for GitHub Pages
- `src/compile.ts` creates self-contained binaries for mac/linux/windows
- Everything is TypeScript with Deno's built-in toolchain
