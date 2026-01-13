/**
 * File discovery utilities for scripts and tooling.
 */
import { Glob } from 'bun'

import type { GetSourceFilesOptions } from './types'

/**
 * Find TypeScript source files for linting/checking.
 *
 * Automatically excludes:
 * - Test files (*.test.ts)
 * - Declaration files (*.d.ts)
 * - Index files (index.ts)
 *
 * @param options - Search options
 * @returns Array of file paths
 *
 * @example
 * // Get all source files
 * const files = await getSourceFiles()
 *
 * // Exclude additional files
 * const files = await getSourceFiles({
 *   exclude: f => f.includes('/types/')
 * })
 */
export async function getSourceFiles(options: GetSourceFilesOptions = {}): Promise<string[]> {
	const { directory = 'packages', exclude } = options

	const glob = new Glob('**/*.ts')
	const matches: string[] = []

	for await (const file of glob.scan({ cwd: directory })) {
		if (file.includes('dist')) continue
		if (file.includes('node_modules')) continue
		if (file.endsWith('.test.ts')) continue
		if (file.endsWith('.d.ts')) continue
		if (file.endsWith('index.ts')) continue

		const fullPath = `${directory}/${file}`

		if (exclude && exclude(fullPath)) continue

		matches.push(fullPath)
	}

	return matches
}
