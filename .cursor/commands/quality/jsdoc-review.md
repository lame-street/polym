# JSDoc Review

Systematic review of changed files for missing/incomplete JSDoc before committing.

## Process

1. **Detect missing JSDoc** — run the check script:

    ```bash
    bun scripts/checks/check-jsdoc.ts
    ```

2. For each violation:
    - Add JSDoc with required tags
    - Verify description, @param, @returns are present

## Scope

**Document:** Exported functions, methods, classes, interfaces, non-trivial types

**Skip:** Private functions, simple type aliases, re-exports, tests

## Required Tags

| Tag                  | When                           |
| -------------------- | ------------------------------ |
| Description          | Always (first line)            |
| `@module`            | Top of each file (module path) |
| `@param name - Desc` | Each parameter                 |
| `@returns`           | Non-void returns               |
| `@typeParam`         | Generic type parameters        |
| `@throws {Error}`    | If function throws             |
| `@example`           | Complex/non-obvious APIs       |
| `@default`           | Optional params with defaults  |
| `@yields`            | Generator functions            |

## Format

````typescript
/**
 * @module @timeback/package-name
 */

/**
 * Short description of what it does.
 *
 * Longer explanation if needed — behavior details, edge cases,
 * or context that helps callers understand usage.
 *
 * @typeParam T - Entity type
 * @param id - Resource identifier
 * @param options - Configuration options
 * @param options.limit - Max items to return
 * @default 100
 * @returns The resource, or undefined if not found
 * @throws {NotFoundError} If resource doesn't exist
 *
 * @example
 * ```typescript
 * const user = await getUser('123')
 * ```
 */
````

**Rules:**

- Blank line between description and tags
- Dash separator: `@param name - Description`
- No types in JSDoc (TypeScript has them)
- Tag order: @typeParam → @param → @default → @returns → @yields → @throws → @example
- Use `@typeParam` not `@template` (standardize)

## Bad Examples

```typescript
/** This function fetches a user */ // "This function" is noise
/** @param path */ // No description
/** @param path: string */ // Redundant type
/** @param path The path */ // Missing dash
```

## Checklist

- [ ] Files have `@module` at top
- [ ] Exports have description + @param + @returns
- [ ] Generics have @typeParam
- [ ] Optional params with defaults have @default
- [ ] Generators have @yields
- [ ] Throwing functions have @throws
- [ ] No redundant type annotations
