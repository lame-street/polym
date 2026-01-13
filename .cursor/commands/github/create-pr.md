# Creating GitHub Pull Requests Guide

**IMPORTANT PREVIEW STEP:** Before using any tools to create the Pull Request on GitHub, you MUST first show a complete Markdown preview of the PR (Title and Body) to the user. Ask for their confirmation before proceeding.

**Key PR Details:**

- **Repository:** `superbuilders/timeback`
- **Head Branch:** Determine automatically via `git branch --show-current`. Do not ask the user.
- **Base Branch:** Almost always `dev`. Only ask if it seems incorrect.

**Changeset Reminder:**

If the PR changes a publishable package (`@timeback/*` clients, `timeback`, `timeback-studio`), ensure a changeset file exists:

```bash
bun run release:add
```

See `docs/guidelines/changesets.md` for when and how to add changesets.

**PR Formatting Guidelines:**

1. **Title:** Concise, descriptive summary of the PR's main purpose.

2. **Body Structure:** Two required sections:

```
This PR:
- First change description
- Second change description

Notes:
- Additional context or considerations
```

3. **Link Issues:** At the end of the body, use `Closes #123` or `Fixes #123`.

**Example PR:**

```
Title: Add SST deploy workflows with OIDC authentication

Body:
This PR:
- Replaces CI/PR workflows with SST-based deploy and preview workflows
- Adds OIDC authentication using IAM roles (no static AWS credentials)
- Configures staging environment for dev branch deployments

Notes:
- IAM roles created: timeback-github-production, timeback-github-dev, timeback-github-pr
- GitHub environments created: production, staging, preview

Closes #42
```
