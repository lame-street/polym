#!/usr/bin/env bun
/**
 * Normalize fetched OpenAPI specs to remove dynamic values.
 *
 * Some upstream APIs include dynamic timestamps in example values (e.g. sendTime).
 * These change on every fetch, creating noisy diffs. This script normalizes them
 * to stable placeholders so only meaningful changes trigger PRs.
 *
 * Usage:
 *   bun scripts/timeback/normalize-api-specs.ts
 */
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const DOCS_DIRS = [
	'docs/timeback/beyond-ai/apis/.originals',
	'docs/timeback/learn-with-ai/apis/.originals',
]

/**
 * Patterns to normalize. Each entry maps a regex to its replacement.
 * These are typically timestamps or other values that change on every API response.
 *
 * We use text replacement (not YAML parsing) to preserve original formatting.
 */
const NORMALIZE_PATTERNS: { pattern: RegExp; replacement: string; name: string }[] = [
	{
		name: 'sendTime',
		// Matches: sendTime: '2025-12-29T01:30:37.531Z' (with various quote styles)
		pattern: /sendTime:\s*['"]?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z['"]?/g,
		replacement: "sendTime: '<dynamic-timestamp>'",
	},
]

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

let totalFiles = 0
let normalizedFiles = 0
let totalChanges = 0

for (const dir of DOCS_DIRS) {
	let files: string[]
	try {
		files = readdirSync(dir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
	} catch {
		// Directory doesn't exist, skip
		continue
	}

	for (const file of files) {
		const filePath = join(dir, file)
		let content = await Bun.file(filePath).text()
		const originalContent = content

		totalFiles++
		let fileChanges = 0

		for (const { pattern, replacement } of NORMALIZE_PATTERNS) {
			const matches = content.match(pattern)
			if (matches) {
				fileChanges += matches.length
				content = content.replace(pattern, replacement)
			}
		}

		if (content !== originalContent) {
			await Bun.write(filePath, content)
			normalizedFiles++
			totalChanges += fileChanges
			console.log(`[NORMALIZED] ${file} (${fileChanges} changes)`)
		}
	}
}

if (totalChanges > 0) {
	console.log(
		`\nNormalized ${normalizedFiles}/${totalFiles} files (${totalChanges} total changes)`,
	)
} else {
	console.log(`\nNo dynamic values found in ${totalFiles} files`)
}
