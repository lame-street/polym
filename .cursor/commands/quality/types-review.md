# Type Organization Review

Systematic review of changed files for colocated types that should be extracted.

## Process

1. **Detect violations** — run the check script:

    ```bash
    bun scripts/checks/check-type-locations.ts
    ```

2. For each violation:
    - Determine if internal-only or shared/exported
    - Move shared types to appropriate `types.ts`
    - Verify imports use `import type` where possible

## Convention

**Types belong in dedicated `types.ts` files**, not colocated with implementation.

### Structure

```
# Simple module
lib/
  handler.ts       ← implementation
  types.ts         ← types for this module

# Complex package
src/
  types.ts         ← entry point (re-exports from types/)
  types/
    index.ts       ← barrel file
    base.ts        ← shared types
    client.ts      ← config types
    domain.ts      ← domain-specific types
```

### Exceptions (rare)

Colocation is acceptable only for:

- Internal types used only within that file (uncommon; most types end up shared)
- Extremely simple types (e.g., literal unions: `type Mode = 'read' | 'write'`)

**Default to extraction.** If unsure, extract it.

### Must Extract

- Interfaces used by multiple files
- Types that are part of the public API
- Types imported by consumers

### Export Only When Needed

Don't speculatively export types in barrel files. A type should only be exported if:

- It's part of the public API (documented, intentional)
- There's an existing consumer importing it

If a type is only used internally within the package, keep it unexported.

## Examples

```typescript
// ❌ BAD: Exported type in implementation file
// src/resources/users.ts
export interface UserCreateInput {
  givenName: string
  familyName: string
}

export class UsersResource {
  create(input: UserCreateInput) { ... }
}
```

```typescript
// ✅ GOOD: Types in dedicated file
// src/types/rostering.ts
export interface UserCreateInput {
  givenName: string
  familyName: string
}

// src/resources/users.ts
import type { UserCreateInput } from '../types'

export class UsersResource {
  create(input: UserCreateInput) { ... }
}
```

## Checklist

- [ ] No `export interface` in implementation files (except internal)
- [ ] No `export type` in implementation files (except internal/simple)
- [ ] Types imported with `import type` where possible
- [ ] Type files have `@module` JSDoc at top
- [ ] Complex packages have `types/` directory with barrel file
