import { resolve } from 'node:path'

import type { PackageJson } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Reading
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Read package.json from a directory or file path.
 * Always reads fresh from disk (no import caching issues).
 *
 * @param path - Directory containing package.json, or path to package.json itself
 * @returns The package.json object
 *
 * @example
 * const pkg = await readPackageJson('.')
 * const pkg = await readPackageJson('./packages/my-lib')
 * const pkg = await readPackageJson('./package.json')
 */
export function readPackageJson(path: string): Promise<PackageJson> {
	const filePath = path.endsWith('package.json') ? path : resolve(path, 'package.json')
	return Bun.file(filePath).json()
}

// ─────────────────────────────────────────────────────────────────────────────
// Writing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect indentation used in a JSON file.
 * Returns the indent string (e.g., '  ' or '    ' or '\t').
 * @param content - The JSON file content
 * @returns The indentation string used
 */
function detectIndent(content: string): string {
	// Look for the first indented line (after opening brace)
	const match = content.match(/\n(\s+)"/)
	return match?.[1] ?? '    '
}

/**
 * Write package.json to a directory or file path.
 * Preserves the original indentation style.
 *
 * @param path - Directory containing package.json, or path to package.json itself
 * @param pkg - The package.json content to write
 * @param indent - Indentation string (auto-detected if not provided)
 *
 * @example
 * await writePackageJson('.', { ...pkg, version: '1.2.3' })
 */
export async function writePackageJson(
	path: string,
	pkg: PackageJson,
	indent?: string,
): Promise<void> {
	const filePath = path.endsWith('package.json') ? path : resolve(path, 'package.json')

	if (!indent) {
		try {
			const existing = await Bun.file(filePath).text()
			indent = detectIndent(existing)
		} catch {
			indent = ' '.repeat(4) // default to 4 spaces
		}
	}

	await Bun.write(filePath, JSON.stringify(pkg, null, indent) + '\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update specific fields in package.json without reading the whole file.
 * Merges the updates with existing content.
 *
 * @param path - Directory containing package.json, or path to package.json itself
 * @param updates - Partial package.json updates to merge
 * @returns The updated package.json
 * @example
 * await updatePackageJson('.', { version: '1.2.3' })
 */
export async function updatePackageJson(
	path: string,
	updates: Partial<PackageJson>,
): Promise<PackageJson> {
	const pkg = await readPackageJson(path)
	const updated = { ...pkg, ...updates }
	await writePackageJson(path, updated)
	return updated
}

/**
 * Format package as name@version string.
 *
 * @param pkg - The package.json object
 * @returns Formatted string like 'my-package@1.2.3'
 * @example
 * formatPackageId(pkg)  // 'my-package@1.2.3'
 */
export function formatPackageId(pkg: PackageJson): string {
	return `${pkg.name}@${pkg.version}`
}

/**
 * Check if a package has a dependency (in any dependency field).
 *
 * @param pkg - The package.json object
 * @param name - The dependency name to check
 * @returns True if dependency exists in deps/devDeps/peerDeps
 * @example
 * hasDependency(pkg, 'react')  // true if react is in deps/devDeps/peerDeps
 */
export function hasDependency(pkg: PackageJson, name: string): boolean {
	return !!(
		pkg.dependencies?.[name] ||
		pkg.devDependencies?.[name] ||
		pkg.peerDependencies?.[name]
	)
}
