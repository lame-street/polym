# Using the Timeback CLI

Guide for AI agents to effectively use the Timeback CLI for data operations.

## Setup

**Important**: All CLI commands must be run from the CLI package directory:

```bash
cd packages/cli
```

Run commands using `bun run src/cli.ts`

**Important**: All terminal tool calls should be run with all permissions (`["all"]`)

Credentials are pre-configured. If you encounter auth errors, ask the user to run `timeback credentials add`.

## Environment Selection

**Critical**: Data exists in different environments. If a resource isn't found, you may be querying the wrong environment:

```bash
# Production data (most common for real queries)
bun run src/cli.ts api oneroster users list --env production

# Staging (default if not specified)
bun run src/cli.ts api oneroster users list --env staging
```

**Always ask the user which environment** _IF_ you get "not found" errors for resources they expect to exist.

## Discovery

Before executing commands, discover the API surface:

```bash
# Get complete command structure as JSON (best for parsing)
bun run src/cli.ts api describe --service oneroster

# Get just command paths (quick reference)
bun run src/cli.ts api describe --service oneroster --format paths
```

The describe command shows all available resources, their CRUD operations, and scoped subcommands.

## Services Overview

### OneRoster (`timeback api oneroster`)

IMS Global standard for educational rostering data. Full CRUD for:

- **Users**: students, teachers, administrators, guardians
- **Organizations**: schools, districts
- **Classes**: course sections with enrolled students/teachers
- **Courses**: curriculum definitions with components
- **Enrollments**: user-to-class relationships
- **Academic Sessions**: terms, grading periods, school years
- **Gradebook**: line items, results, categories, score scales
- **Resources**: digital learning materials

### Caliper (`timeback api caliper`)

IMS Global learning analytics events:

- **events send/validate**: Submit Caliper events
- **events list/get**: Query stored events
- **jobs status/wait**: Track async processing

### Edubridge (`timeback api edubridge`)

Simplified enrollment and analytics (abstracts OneRoster complexity):

- **enrollments**: Course-centric enrollment management
- **analytics**: Activity metrics, weekly facts, grade mastery
- **applications**: Learning platform integrations
- **subject-tracks**: Grade-level course mappings

## Common Patterns

### Output Processing with jq

Pipe JSON output to `jq` for extraction and transformation:

```bash
# Count results
bun run src/cli.ts api oneroster users list --env production --max 100 | jq '.users | length'

# Extract specific fields
bun run src/cli.ts api oneroster courses get <id> --env production | jq '.course.title'

# Filter and format
bun run src/cli.ts api oneroster enrollments list --active --env production | jq '[.enrollments[] | {id: .sourcedId, class: .class.sourcedId, user: .user.sourcedId}]'
```

### Pagination

```bash
# Cap total results (IMPORTANT: always use --max to avoid fetching entire datasets)
bun run src/cli.ts api oneroster users list --max 100

# --limit controls page size, NOT total results
bun run src/cli.ts api oneroster users list --limit 50 --max 200
```

### Filtering

#### Status Filtering

Use `--active` or `--deleted` to filter by record status:

```bash
# Active resources only
bun run src/cli.ts api oneroster users list --active
bun run src/cli.ts api oneroster enrollments list --active

# Deleted/pending deletion
bun run src/cli.ts api oneroster users list --deleted
```

#### Multi-Value Filters (OR Logic)

Comma-separated values create OR conditions:

```bash
# Enrollments for multiple classes
bun run src/cli.ts api oneroster enrollments list --active --classes class1,class2,class3

# Multiple roles
bun run src/cli.ts api oneroster users list --role student,teacher
```

#### Other Filters

```bash
# Filter by role
bun run src/cli.ts api oneroster users list --role teacher

# Search across fields
bun run src/cli.ts api oneroster users list --search "john"

# Combine filters (AND logic)
bun run src/cli.ts api oneroster users list --role student --active
```

### CRUD Operations

```bash
# List all
bun run src/cli.ts api oneroster users list

# Get by ID
bun run src/cli.ts api oneroster users get <id>

# Create (from JSON data or file)
bun run src/cli.ts api oneroster users create --data '{"givenName": "John", ...}'
bun run src/cli.ts api oneroster users create --file user.json

# Update (full replacement)
bun run src/cli.ts api oneroster users update <id> --data '...'

# Patch (partial update) - enrollments, assessmentLineItems, assessmentResults
bun run src/cli.ts api oneroster enrollments patch <id> --data '{"status": "completed"}'

# Delete
bun run src/cli.ts api oneroster users delete <id>
```

### Scoped Queries

Access nested resources by parent ID. Scoped queries also support filters:

```bash
# Enrollments in a school (with status filter)
bun run src/cli.ts api oneroster schools enrollments <schoolId> --active

# Classes for a course
bun run src/cli.ts api oneroster courses classes <courseId>

# Students in a class
bun run src/cli.ts api oneroster classes students <classId>

# Demographics for a user
bun run src/cli.ts api oneroster users demographics <userId>
```

### User Management

```bash
# Enable/disable users
bun run src/cli.ts api oneroster users enable <userId>
bun run src/cli.ts api oneroster users disable <userId>

# Set role
bun run src/cli.ts api oneroster users set-role <userId> --org <orgId> --role student

# Agent relationships (guardians/parents)
bun run src/cli.ts api oneroster users agents <userId>
bun run src/cli.ts api oneroster users agents-add <userId> <agentId>
bun run src/cli.ts api oneroster users agents-remove <userId> <agentId>
bun run src/cli.ts api oneroster users agent-for <userId>

# Credentials
bun run src/cli.ts api oneroster users credentials-create <userId> --data '...'
bun run src/cli.ts api oneroster users credentials-decrypt <userId> <credentialId>
```

### Class Enrollment

```bash
bun run src/cli.ts api oneroster classes enroll <classId> <userId> --role student
bun run src/cli.ts api oneroster classes enroll <classId> <userId> --role teacher
```

### Course Components

```bash
# List/get components
bun run src/cli.ts api oneroster courses components list
bun run src/cli.ts api oneroster courses components get <id>

# Create/update/delete
bun run src/cli.ts api oneroster courses components create --data '...'
bun run src/cli.ts api oneroster courses components update <id> --data '...'
bun run src/cli.ts api oneroster courses components delete <id>

# Component resources (same pattern)
bun run src/cli.ts api oneroster courses component-resources list
```

## Error Handling

Commands exit with non-zero codes on failure. Errors are written to stderr in a parseable format:

```bash
# Check exit code
bun run src/cli.ts api oneroster users get invalid-id || echo "Failed"
```

## Tips for AI Agents

1. **Specify environment**: Always use `--env production` for real data queries. Default is staging.
2. **Use `--max`**: Cap results to avoid accidentally fetching entire datasets.
3. **Discover first**: Run `api describe --service oneroster` to understand available commands.
4. **Filter by status**: Use `--active` or `--deleted` to filter by record status.
5. **Combine with jq**: Pipe output to `jq` for counting, filtering, and field extraction.
6. **Use comma-separated OR**: e.g. `--classes id1,id2,id3` queries multiple classes in one request.
