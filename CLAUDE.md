# Agent Guidelines

## Build & Test

```sh
./deno.sh task check   # typecheck + lint (run this when you think you're done)
./deno.sh task test    # run tests
./deno.sh task dev     # dev server with live reload
./deno.sh task start   # production server
./deno.sh task dist    # build static site to ./dist/site
./deno.sh task compile # build binaries to ./dist/bin/<target>/
./deno.sh task clean   # clean caches/builds
```

## Code Style

- This codebase optimizes imports on save, so always use the import when you add it before you save your changes, otherwise the import will be removed and you will be in a loop
- Use tabs for indentation, not spaces
- Prefer `string[]` over `Array<string>`
- Prefer `[...iterable]` over `Array.from(iterable)`
- Prefer `{ ...obj1, ...obj2 }` over `Object.assign({}, obj1, obj2)`
- Prefer `import type { X }` when importing only types
- Prefer `globalThis` over `window` or `self`
- Avoid `.forEach()` - use `for...of` or array methods that return values
- Use guard clauses: handle negative conditions first with early return/continue/throw
- Use `override` keyword when overriding methods

## Assertions & Nullability

- Avoid `!` and `?` operators as first resort
- Prefer: guards (`if (x !== undefined)`), destructuring with defaults, or explicit assertions
- For array access after bounds checks, `arr[0]!` is acceptable, but prefer destructuring

## Comments

- Comments explain *why*, not *what*
- Don't restate function names or obvious code
- Never leave comments that document following instructions
- Never delete existing comments unless deleting the relevant code too

## File Organization

- Primary exports at top (main classes, components, handlers)
- Supporting exports next (types, utilities)
- Private/unexported code at bottom
- Group related functions together
- Avoid excessive file splitting - group related code in single files

## Types

- Prefer `as const satisfies Type` for const objects that need both literal types and validation
- Prefer `ReturnType<typeof fn>` over manually defining return types
- Avoid `as`/`any`/`unknown` kludges - look for better patterns first
- Avoid using the `in` operator to check for property existence on Partial types. Use dot notation (`obj.prop !== undefined`) instead. Reserve `in` for discriminating union types where the compiler benefits from narrowing (e.g., `'appId' in pluginId` to distinguish `{ appId } | { integrationId }`)

## UX & Copy

When designing UX or writing copy, use (and cite in chat) your rationale based on the Apple Human Interface Guidelines.

## Task Completion

A task is NOT complete until it actually works end-to-end. Keep working until it ACTUALLY works or admit you're stuck. Never declare victory when things are failing or only partially working.
