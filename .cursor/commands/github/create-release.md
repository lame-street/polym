# Creating Release Pull Requests (dev → main)

**IMPORTANT:** Before creating the PR, show a complete preview of Title and Body in a plaintext codeblock.

Ask for confirmation before creating the PR.

## PR Details

- **Repository:** `superbuilders/timeback`
- **Head Branch:** `dev`
- **Base Branch:** `main`
- **Title Format:** `Release: YYYY-MM-DD`

## What Happens After Merge

1. **Deploy workflow** runs → deploys to production
2. **Release workflow** runs → if changesets exist, creates "Version Packages" PR
3. **Merge Version Packages PR** → publishes packages to npm

See `docs/guidelines/changesets.md` for the full publishing flow.

## Process

1. **Run the release notes script:**

```bash
bun util:release-notes
```

Use `required_permissions: ["all"]` to ensure success.

2. **Review the output** — it shows PRs merged to dev since the last release

3. **Write a concise summary** focusing on user-facing changes, not implementation details

4. **Show preview to user** before creating

## PR Body Structure

```markdown
## Summary

[2-3 sentences describing the most important changes]

### Changes

- Brief bullet describing change
- Another change in minimal words
- Keep each bullet to 1 line

## PRs Included

[List from script output]
```

## Guidelines

- Keep it TERSE — aim for ~15-25 lines total
- Focus on user impact, not code details
- NO emojis or exclamation marks
- This is a "deploy gate" — real review happened at feature level
- Group related changes only when it improves clarity
