import { dirname, resolve } from 'node:path'

import type { FindUpOptions } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Finding Files
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find a file by searching up the directory tree.
 * Useful for finding root config files in monorepos.
 *
 * @param filename - Filename to search for (or array of alternatives)
 * @param options - Search options
 * @returns Absolute path to file, or null if not found
 *
 * @example
 * // Find nearest package.json
 * await findUp('package.json')
 *
 * // Find config with multiple possible names
 * await findUp(['config.ts', 'config.js', 'config.json'])
 *
 * // Search from specific directory
 * await findUp('tsconfig.json', { cwd: './packages/my-lib' })
 */
export async function findUp(
	filename: string | string[],
	options: FindUpOptions = {},
): Promise<string | null> {
	const { cwd = process.cwd(), maxDepth = 10 } = options
	const filenames = Array.isArray(filename) ? filename : [filename]

	let currentDir = resolve(cwd)
	let depth = 0

	while (depth <= maxDepth) {
		for (const name of filenames) {
			const filePath = resolve(currentDir, name)
			const file = Bun.file(filePath)

			if (await file.exists()) {
				return filePath
			}
		}

		const parentDir = dirname(currentDir)

		// Reached filesystem root
		if (parentDir === currentDir) {
			break
		}

		currentDir = parentDir
		depth++
	}

	return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Reading Files
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Read a JSON file that may contain comments (JSONC).
 * Strips single-line (//) and multi-line comments before parsing.
 * Useful for tsconfig.json, .vscode/settings.json, etc.
 *
 * @param path - Path to the JSONC file
 * @returns Promise resolving to parsed JSON content
 *
 * @example
 * const tsconfig = await readJsonc<TsConfig>('tsconfig.json')
 */
export async function readJsonc<T = unknown>(path: string): Promise<T> {
	const content = await Bun.file(path).text()
	const stripped = stripJsonComments(content)
	return JSON.parse(stripped) as T
}

/**
 * Strip comments from JSON string (for JSONC files).
 * Removes single-line (//) and multi-line comments.
 *
 * @param jsonc - JSON string with comments
 * @returns JSON string without comments
 */
function stripJsonComments(jsonc: string): string {
	// Remove multi-line comments /* ... */
	let result = jsonc.replaceAll(/\/\*[\s\S]*?\*\//g, '')
	// Remove single-line comments // ...
	result = result.replaceAll(/\/\/.*/g, '')
	return result
}
