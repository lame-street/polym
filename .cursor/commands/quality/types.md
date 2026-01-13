# Type Organization

Types belong in dedicated `types.ts` files, not colocated with implementation.

## Structure

```
# Simple module
lib/
  handler.ts       ← implementation
  types.ts         ← types for this module

# Complex package
src/
  types.ts         ← entry point (re-exports from types/)
  types/
    index.ts       ← barrel
    base.ts        ← shared types
    domain.ts      ← domain-specific types
```

## Rules

- Extract `export interface`/`export type` from implementation files
- Use `import type` for type-only imports
- Default to extraction (colocation is rare and only applicable to extremely simple, internal-only types)
- Only export types with consumers (don't add to barrel files speculatively)

## Quick Fix

```typescript
// ❌ In implementation file
export interface UserInput { ... }
export class UsersResource { ... }

// ✅ Extract to nearest types.ts
// types.ts
export interface UserInput { ... }

// users.ts
import type { UserInput } from './path/to/types'
export class UsersResource { ... }
```
