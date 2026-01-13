#!/usr/bin/env bun
/**
 * Check for missing JSDoc on functions and classes.
 *
 * Finds declarations that are not preceded by a JSDoc comment.
 *
 * Usage:
 *   bun scripts/checks/check-jsdoc.ts
 */
import { getSourceFiles } from '@polym/utils/server'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Violation {
	file: string
	line: number
	name: string
	kind: 'function' | 'class' | 'arrow'
}

// ─────────────────────────────────────────────────────────────────────────────
// Patterns
// ─────────────────────────────────────────────────────────────────────────────

// Matches: function foo, async function foo, export function foo, export async function foo
const functionPattern = /^(export )?(async )?function (\w+)/
// Matches: class Foo, abstract class Foo, export class Foo, export abstract class Foo
const classPattern = /^(export )?(abstract )?class (\w+)/
// Matches: const foo = () =>, const foo = async () =>, export const foo = () =>
const arrowFnPattern = /^(export )?const (\w+)\s*(:\s*[^=]+)?\s*=\s*(async\s*)?\([^)]*\)\s*=>/

/**
 * Extract declaration name and kind from a line.
 *
 * @param line - Source line to check
 * @returns Declaration info or null if not a declaration
 */
function getDeclaration(line: string): { name: string; kind: Violation['kind'] } | null {
	const fnMatch = line.match(functionPattern)
	if (fnMatch) return { name: fnMatch[3]!, kind: 'function' }

	const classMatch = line.match(classPattern)
	if (classMatch) return { name: classMatch[3]!, kind: 'class' }

	const arrowMatch = line.match(arrowFnPattern)
	if (arrowMatch) return { name: arrowMatch[2]!, kind: 'arrow' }

	return null
}

/**
 * Format a declaration for display.
 *
 * @param v - The violation
 * @returns Formatted string
 */
function formatDeclaration(v: Violation): string {
	switch (v.kind) {
		case 'function':
			return `function ${v.name}()`
		case 'class':
			return `class ${v.name}`
		case 'arrow':
			return `const ${v.name} = () =>`
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Check for missing JSDoc
// ─────────────────────────────────────────────────────────────────────────────

const files = await getSourceFiles()

if (files.length === 0) {
	console.log('No files to check.')
	process.exit(0)
}

const violationsByFile = new Map<string, Violation[]>()

for (const file of files) {
	const content = await Bun.file(file).text()
	const lines = content.split('\n')

	// Track functions that have JSDoc (for overload detection)
	const documentedFunctions = new Set<string>()

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]!
		const decl = getDeclaration(line)
		if (!decl) continue

		// Check if previous non-empty line ends with */
		let hasJsdoc = false
		for (let j = i - 1; j >= 0; j--) {
			const prevLine = lines[j]!.trim()
			if (prevLine === '') continue
			if (prevLine.endsWith('*/')) {
				hasJsdoc = true
			}
			break
		}

		// Skip if this is an overload of an already-documented function
		if (documentedFunctions.has(decl.name)) {
			continue
		}

		if (hasJsdoc) {
			documentedFunctions.add(decl.name)
		} else {
			if (!violationsByFile.has(file)) {
				violationsByFile.set(file, [])
			}
			violationsByFile.get(file)!.push({
				file,
				line: i + 1,
				name: decl.name,
				kind: decl.kind,
			})
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

if (violationsByFile.size === 0) {
	console.log('All functions and classes have JSDoc.')
	process.exit(0)
}

let totalViolations = 0

console.log()

for (const [file, violations] of violationsByFile) {
	totalViolations += violations.length

	console.log(`${file}`)
	console.log('─'.repeat(Math.min(file.length, 60)))
	for (const v of violations) {
		console.log(`  Line ${v.line}: ${formatDeclaration(v)}`)
	}
	console.log('')
}

const divider = '='.repeat(60)

const instructions = [
	divider,
	`Found ${totalViolations} declaration(s) missing JSDoc in ${violationsByFile.size} file(s)`,
	divider,
	'',
	'Add a JSDoc comment above each declaration:',
	'',
	'  /**',
	'   * Brief description of what it does.',
	'   *',
	'   * @param name - Description of parameter',
	'   * @returns Description of return value',
	'   */',
	'',
].join('\n')

console.log(instructions)

process.exit(1)
