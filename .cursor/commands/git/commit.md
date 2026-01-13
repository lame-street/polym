# Commit

Commit changes with git. Use `required_permissions: ["all"]` to account for pre-commit hooks. Only `git add -A` if needed.

## Context

Before writing the commit message, understand what's being committed:

- If you made the changes in this session, use that context
- Otherwise, run `git diff --staged` or `git diff` to review changes
- If you're having trouble understanding something, compare against the `dev` branch

**Important:** Describe the final state relative to the base branch (`dev`), not changes between commits within the same branch.

Example: You're on a feature branch. Earlier you added `list()` returning `Paginator<T>`. Later you changed it to return `Promise<T[]>`. When committing:

- ❌ Wrong: "Changed list() from Paginator<T> to Promise<T[]>"
- ✅ Right: "list() returns Promise<T[]> for idiomatic usage"

The base branch never had `list()`; returning `Paginator<T>` was was an intermediate state in your branch. Describe what exists now vs what existed before the branch, not the journey within the branch.

## Format

### Title

```
type(scope): concise imperative description
```

### Body

Proportionate to change size: small changes get a line or two, large changes get detailed bullets/examples.

- **Fixes:** problem → solution
- **Features:** bullet list; before/after for UX changes

Title under 72 chars. No fluff.

## Examples

### Small (~1-20 lines)

✅ Good:

```
chore(cli): remove unused test script

Not used; simplifies package.json.
```

❌ Bad (no body):

```
chore(cli): remove unused test script
```

❌ Bad (over-explained):

```
chore(cli): remove unused test script

This commit removes the test script from package.json because it was
not being used anywhere in the codebase. The script was originally
added for testing purposes but is no longer needed...
```

### Medium (~20-100 lines)

✅ Good:

```
fix(studio): sync canvas nodes when courses prop changes

useNodesState only uses initial value on first render. Add useEffect
to update nodes when courses load asynchronously.
```

❌ Bad (too terse):

```
fix(studio): fix canvas bug
```

### Large (100-500 lines)

✅ Good:

```
feat(cli): add dedicated filter flags for OneRoster resources

Replace --filter string syntax with ergonomic per-resource flags:

  # Before
  timeback api oneroster users list --filter "role='teacher'"

  # After
  timeback api oneroster users list --role teacher

- Resource-specific flags: --status, --role, --email, --name, etc.
- Text fields use partial matching by default
- Add --exact flag for exact matching
```

❌ Bad (missing detail):

```
feat(cli): add filter flags

Added some new flags for filtering.
```

### Very Large (500+ lines, multi-scope)

For commits spanning multiple packages/features, group by scope:

✅ Good:

```
feat(oneroster): type-safe filtering and sorting API

BREAKING CHANGE: list() now returns Promise<T[]> instead of Paginator<T>

**Client SDK**
- list() returns Promise<T[]> for idiomatic usage
- stream() returns Paginator<T> for lazy pagination
- Add type-safe 'where' clause with object shorthand syntax
- Add type-safe 'sort' field with autocomplete

**CLI**
- Update list handlers to use new API
- Add dedicated filter flags per resource

**Documentation**
- Add pagination-api.md architecture doc
- Update examples across packages
```

❌ Bad (wall of bullets):

```
feat(oneroster): updates

- Changed list
- Added stream
- Updated CLI
- Fixed tests
- Added docs
- Changed types
- Updated examples
...
```
