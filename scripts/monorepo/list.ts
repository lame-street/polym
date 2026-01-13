#!/usr/bin/env bun
/**
 * List all packages in the monorepo.
 *
 * Usage:
 *   bun scripts/monorepo/list.ts
 */
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// ─────────────────────────────────────────────────────────────────────────────
// Read workspace locations from package.json
// ─────────────────────────────────────────────────────────────────────────────

interface RootPackageJson {
	workspaces?: { packages?: string[] } | string[]
}

interface PackageJson {
	name?: string
	version?: string
	private?: boolean
}

const rootPkg: RootPackageJson = await Bun.file('package.json').json()
const workspacePatterns = Array.isArray(rootPkg.workspaces)
	? rootPkg.workspaces
	: (rootPkg.workspaces?.packages ?? [])

const packageDirs = workspacePatterns
	.filter(pattern => pattern.endsWith('/*'))
	.map(pattern => pattern.replace('/*', ''))

// ─────────────────────────────────────────────────────────────────────────────
// Collect packages
// ─────────────────────────────────────────────────────────────────────────────

interface PackageInfo {
	path: string
	name: string
	version: string
	private: string
}

const packages: PackageInfo[] = []

// Get nested workspace dirs to exclude from parent scan
const nestedDirs = packageDirs.filter(dir => dir.includes('/'))

for (const dir of packageDirs) {
	if (!existsSync(dir)) continue

	const entries = readdirSync(dir, { withFileTypes: true })
		.filter(d => d.isDirectory() && !d.name.startsWith('_'))
		.filter(d => !nestedDirs.some(nested => nested === join(dir, d.name)))

	for (const entry of entries) {
		const pkgPath = join(dir, entry.name)
		const pkgJsonPath = join(pkgPath, 'package.json')

		if (!existsSync(pkgJsonPath)) continue

		const pkg: PackageJson = await Bun.file(pkgJsonPath).json()

		packages.push({
			path: pkgPath,
			name: pkg.name ?? '(unnamed)',
			version: pkg.version ?? '-',
			private: pkg.private ? '✓' : '',
		})
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

if (packages.length === 0) {
	console.log('No packages found.')
} else {
	console.table(packages)
}
