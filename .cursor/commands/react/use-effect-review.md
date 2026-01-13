# `useEffect` Review

Review all `useEffect` hooks in the current file (or specified file) for potential issues.

## Instructions

For each `useEffect` found:

1. **Show the code** — Display the effect with line numbers (if long, omitting parts is OK)
2. **Rate on two scales (1-10)**:
    - **Problematic**: How likely is this effect to cause bugs? (race conditions, stale closures, memory leaks, unnecessary re-renders, derived state anti-patterns)
    - **Refactor Difficulty**: How hard would it be to refactor to a better pattern?
3. **Explain the issues** — Be concise but specific about what could go wrong
4. **Suggest alternatives** — TanStack Query, custom hooks, merging effects, using useState instead, moving logic elsewhere

## Common Anti-Patterns to Flag

- **Async in useEffect without cleanup** — Race conditions, state updates after unmount
- **Derived state syncing** — "When X changes, set Y" should happen where X is set
- **Missing dependencies** — Stale closures
- **Object/array dependencies** — Referential instability causing infinite loops
- **Fetching data** — Usually better with TanStack Query or server components
- **Subscriptions without cleanup** — Memory leaks

## Legitimate Uses (low problem score)

- Setup/cleanup for browser APIs (ResizeObserver, IntersectionObserver, event listeners)
- Syncing with external systems (analytics, third-party widgets)
- Focus management, scroll position

## Output Format

For each effect, provide a table like:

| Metric                  | Rating | Notes                      |
| ----------------------- | ------ | -------------------------- |
| **Problematic**         | X/10   | Specific issue description |
| **Refactor Difficulty** | X/10   | Suggested approach         |

End with a summary table ranking all effects and a recommendation for which to tackle first (highest problem score + lowest refactor difficulty = best ROI).
