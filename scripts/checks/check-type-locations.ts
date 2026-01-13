#!/usr/bin/env bun
/**
 * Check for types defined outside of types.ts files.
 *
 * Finds `export interface` and `export type` in implementation files
 * that should be extracted to dedicated types.ts files.
 *
 * Usage:
 *   bun scripts/quality/check-type-locations.ts
 */
import { basename } from 'node:path'

import { getSourceFiles } from '@polym/utils/server'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Violation {
	file: string
	line: number
	kind: 'interface' | 'type'
	name: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a file should be excluded from type location checks.
 *
 * Excludes:
 * - Files in a directory named 'types' (e.g., src/types/foo.ts)
 * - Files named 'types.ts' (e.g., src/types.ts)
 * - Files ending with '.types.ts' (e.g., src/foo.types.ts)
 * - Generated files (*.gen.ts)
 *
 * @param filePath - The file path to check
 * @returns True if the file should be excluded
 */
function shouldExclude(filePath: string): boolean {
	const name = basename(filePath)

	// Generated files (e.g., routeTree.gen.ts)
	if (name.endsWith('.gen.ts')) return true

	// Files named exactly 'types.ts'
	if (name === 'types.ts') return true

	// Files ending with '.types.ts' (e.g., foo.types.ts)
	if (name.endsWith('.types.ts')) return true

	// Files in a 'types' directory
	if (filePath.includes('/types/') || filePath.includes('\\types\\')) return true

	return false
}

/**
 * Format a type export statement.
 *
 * @param v - The violation
 * @returns Formatted string
 */
function formatType(v: Violation): string {
	return `export ${v.kind} ${v.name}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Check for colocated types
// ─────────────────────────────────────────────────────────────────────────────

const files = await getSourceFiles({ directory: 'packages', exclude: shouldExclude })

if (files.length === 0) {
	console.log('No files to check.')
	process.exit(0)
}

const typePattern = /^export (interface|type) (\w+)/
const violationsByFile = new Map<string, Violation[]>()

for (const file of files) {
	const content = await Bun.file(file).text()
	const lines = content.split('\n')

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const match = typePattern.exec(line)
		if (!match) continue

		if (!violationsByFile.has(file)) {
			violationsByFile.set(file, [])
		}

		violationsByFile.get(file)!.push({
			file,
			line: i + 1,
			kind: match[1] as 'interface' | 'type',
			name: match[2]!,
		})
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

if (violationsByFile.size === 0) {
	console.log('All types are in the correct location.')
	process.exit(0)
}

let totalViolations = 0

console.log()

for (const [file, violations] of violationsByFile) {
	totalViolations += violations.length

	console.log(`${file}`)
	console.log('─'.repeat(Math.min(file.length, 60)))
	for (const v of violations) {
		console.log(`  Line ${v.line}: ${formatType(v)}`)
	}
	console.log('')
}

const divider = '='.repeat(60)

const instructions = [
	divider,
	`Found ${totalViolations} exported type(s) in ${violationsByFile.size} implementation file(s)`,
	divider,
	'1. Remove "export"',
	"     Internal types (e.g. used only as function parameters/returns) don't need exporting.",
	'     Consumers can pass object literals without importing the type.',
	'2. Move to a sibling types.ts file',
	'     Only if the type is part of the public API and consumers need to import it.',
	'3. Move to a sibling types/ directory',
	'     For complex type hierarchies with multiple related types.',
	'',
].join('\n')

console.log(instructions)

process.exit(1)
