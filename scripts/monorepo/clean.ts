#!/usr/bin/env bun
/**
 * Clean build artifacts and dependencies across all packages.
 *
 * Deletes from root and all workspace packages:
 *   - dist/          (build output)
 *   - .tsbuildinfo   (TypeScript incremental build cache)
 *
 * With --all flag, also deletes:
 *   - node_modules/  (requires re-running `bun install`)
 *
 * Usage:
 *   bun scripts/monorepo/clean.ts           # Clean build artifacts
 *   bun scripts/monorepo/clean.ts --all     # Clean everything including deps
 */
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { confirm, isCancel } from '@clack/prompts'

import { runStep } from '@polym/utils/server'

const CLEAN_DIRS = ['dist', '.tsbuildinfo']
const CLEAN_ALL_DIRS = [...CLEAN_DIRS, 'node_modules']

// ─────────────────────────────────────────────────────────────────────────────
// Parse args
// ─────────────────────────────────────────────────────────────────────────────

const cleanAll = process.argv.includes('--all')
const dirsToClean = cleanAll ? CLEAN_ALL_DIRS : CLEAN_DIRS

// ─────────────────────────────────────────────────────────────────────────────
// Read workspace locations from package.json
// ─────────────────────────────────────────────────────────────────────────────

interface RootPackageJson {
	workspaces?: { packages?: string[] } | string[]
}

const rootPkg: RootPackageJson = await Bun.file('package.json').json()
const workspacePatterns = Array.isArray(rootPkg.workspaces)
	? rootPkg.workspaces
	: (rootPkg.workspaces?.packages ?? [])

const packageDirs = workspacePatterns
	.filter(pattern => pattern.endsWith('/*'))
	.map(pattern => pattern.replace('/*', ''))

// ─────────────────────────────────────────────────────────────────────────────
// Collect package paths
// ─────────────────────────────────────────────────────────────────────────────

const packagePaths: string[] = []

const nestedDirs = packageDirs.filter(dir => dir.includes('/'))

for (const dir of packageDirs) {
	if (!existsSync(dir)) continue

	const entries = readdirSync(dir, { withFileTypes: true })
		.filter(d => d.isDirectory() && !d.name.startsWith('_'))
		.filter(d => !nestedDirs.some(nested => nested === join(dir, d.name)))

	for (const entry of entries) {
		packagePaths.push(join(dir, entry.name))
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm if cleaning node_modules
// ─────────────────────────────────────────────────────────────────────────────

if (cleanAll) {
	const confirmed = await confirm({
		message: 'This will also remove node_modules. Continue?',
		initialValue: false,
	})

	if (isCancel(confirmed) || !confirmed) {
		console.log('Cancelled')
		process.exit(0)
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Clean
// ─────────────────────────────────────────────────────────────────────────────

await runStep(
	'Cleaning packages',
	() => {
		let cleaned = 0

		// Clean root
		for (const dir of dirsToClean) {
			if (existsSync(dir)) {
				rmSync(dir, { recursive: true, force: true })
				cleaned++
			}
		}

		// Clean packages
		for (const pkgPath of packagePaths) {
			for (const dir of dirsToClean) {
				const targetPath = join(pkgPath, dir)
				if (existsSync(targetPath)) {
					rmSync(targetPath, { recursive: true, force: true })
					cleaned++
				}
			}
		}

		return cleaned
	},
	cleaned => `Cleaned ${cleaned} directories`,
)

// ─────────────────────────────────────────────────────────────────────────────
// Done
// ─────────────────────────────────────────────────────────────────────────────

if (cleanAll) {
	console.log('\nNext step: bun install')
}
