#!/usr/bin/env bun
/**
 * Remove a package from the monorepo.
 *
 * Usage:
 *   bun run packages:remove
 *   bun run packages:remove my-package
 */
import { $ } from 'bun'

import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import * as p from '@clack/prompts'

// ─────────────────────────────────────────────────────────────────────────────
// Read workspace locations from package.json
// ─────────────────────────────────────────────────────────────────────────────

interface PackageJson {
	workspaces?: { packages?: string[] } | string[]
}

const rootPkg: PackageJson = await Bun.file('package.json').json()
const workspacePatterns = Array.isArray(rootPkg.workspaces)
	? rootPkg.workspaces
	: (rootPkg.workspaces?.packages ?? [])

// Extract directories from glob patterns (e.g., "packages/*" -> "packages")
const packageDirs = workspacePatterns
	.filter(pattern => pattern.endsWith('/*'))
	.map(pattern => pattern.replace('/*', ''))
	.filter(dir => !dir.startsWith('apps')) // Exclude apps directory

// ─────────────────────────────────────────────────────────────────────────────
// Intro
// ─────────────────────────────────────────────────────────────────────────────

console.log('')
p.intro('Remove a package')

// ─────────────────────────────────────────────────────────────────────────────
// Get available packages
// ─────────────────────────────────────────────────────────────────────────────

interface PackageInfo {
	name: string
	dir: string
	path: string
}

const packages: PackageInfo[] = []

// Get nested workspace dirs (e.g., "packages/clients") to exclude from parent scan
const nestedDirs = packageDirs.filter(dir => dir.includes('/'))

for (const dir of packageDirs) {
	if (!existsSync(dir)) continue

	const entries = readdirSync(dir, { withFileTypes: true })
		.filter(d => d.isDirectory() && !d.name.startsWith('_'))
		// Skip subdirectories that are themselves workspace roots
		.filter(d => !nestedDirs.some(nested => nested === join(dir, d.name)))

	for (const entry of entries) {
		packages.push({
			name: entry.name,
			dir,
			path: join(dir, entry.name),
		})
	}
}

if (packages.length === 0) {
	p.cancel('No packages found')
	process.exit(1)
}

// ─────────────────────────────────────────────────────────────────────────────
// Get package name
// ─────────────────────────────────────────────────────────────────────────────

let selectedPackage: PackageInfo | undefined

const argName = process.argv[2]

if (argName) {
	selectedPackage = packages.find(pkg => pkg.name === argName)
	if (!selectedPackage) {
		p.cancel(`Package not found: ${argName}`)
		process.exit(1)
	}
} else {
	const result = await p.select({
		message: 'Select package to remove',
		options: packages.map(pkg => ({
			value: pkg,
			label: `${pkg.path}`,
		})),
	})

	if (p.isCancel(result)) {
		p.cancel('Cancelled')
		process.exit(0)
	}

	selectedPackage = result
}

const targetDir = selectedPackage.path

// ─────────────────────────────────────────────────────────────────────────────
// Confirm
// ─────────────────────────────────────────────────────────────────────────────

const confirmed = await p.confirm({
	message: `Delete ${targetDir}?`,
	initialValue: false,
})

if (p.isCancel(confirmed) || !confirmed) {
	p.cancel('Cancelled')
	process.exit(0)
}

// ─────────────────────────────────────────────────────────────────────────────
// Remove package
// ─────────────────────────────────────────────────────────────────────────────

const s = p.spinner()

s.start('Removing package')

await $`rm -rf ${targetDir}`.quiet()

s.stop('Package removed')

// ─────────────────────────────────────────────────────────────────────────────
// Update root tsconfig references
// ─────────────────────────────────────────────────────────────────────────────

const rootTsConfigPath = 'tsconfig.json'

if (existsSync(rootTsConfigPath)) {
	try {
		const content = await Bun.file(rootTsConfigPath).text()
		const config = JSON.parse(content)

		if (Array.isArray(config.references)) {
			const originalLength = config.references.length
			config.references = config.references.filter(
				(ref: { path: string }) => ref.path !== targetDir,
			)

			if (config.references.length < originalLength) {
				await Bun.write(rootTsConfigPath, JSON.stringify(config, null, 4) + '\n')
				p.log.success('Updated tsconfig.json references')
			}
		}
	} catch {
		p.log.warn('Could not update tsconfig.json (update manually)')
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Done
// ─────────────────────────────────────────────────────────────────────────────

p.outro(`Removed ${selectedPackage.name}`)
