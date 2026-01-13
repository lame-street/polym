#!/usr/bin/env bun
/**
 * Create a new package from the template.
 *
 * Usage:
 *   bun run packages:create
 *   bun run packages:create my-package
 */
import { $ } from 'bun'

import { existsSync } from 'node:fs'
import { join } from 'node:path'

import * as p from '@clack/prompts'

const TEMPLATE_DIR = 'scripts/monorepo/.template'

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

const packageLocations = workspacePatterns
	.filter(pattern => pattern.endsWith('/*'))
	.map(pattern => pattern.replace('/*', '/'))
	.filter(dir => !dir.startsWith('apps/')) // Exclude apps directory

if (packageLocations.length === 0) {
	console.error('No package workspace patterns found in package.json')
	process.exit(1)
}

// ─────────────────────────────────────────────────────────────────────────────
// Intro
// ─────────────────────────────────────────────────────────────────────────────

console.log('')
p.intro('Create a new package')

// ─────────────────────────────────────────────────────────────────────────────
// Get package location
// ─────────────────────────────────────────────────────────────────────────────

let packagesDir: string

if (packageLocations.length === 1) {
	packagesDir = packageLocations[0]!
} else {
	const locationResult = await p.select({
		message: 'Where should this package live?',
		options: packageLocations.map(dir => ({
			value: dir,
			label: dir,
		})),
	})

	if (p.isCancel(locationResult)) {
		p.cancel('Cancelled')
		process.exit(0)
	}

	packagesDir = locationResult
}

// ─────────────────────────────────────────────────────────────────────────────
// Get package name
// ─────────────────────────────────────────────────────────────────────────────

let packageName = process.argv[2]

if (!packageName) {
	const result = await p.text({
		message: 'Package name',
		placeholder: 'my-package or @scope/my-package',
		validate: value => {
			if (!value) return 'Package name is required'
			if (!/^(@[\w-]+\/)?[\w-]+$/.test(value)) {
				return 'Invalid package name format'
			}
		},
	})

	if (p.isCancel(result)) {
		p.cancel('Cancelled')
		process.exit(0)
	}

	packageName = result
}

// Extract directory name (strip scope if present)
const dirName = packageName.startsWith('@')
	? (packageName.split('/')[1] ?? packageName)
	: packageName

const targetDir = join(packagesDir, dirName)

// ─────────────────────────────────────────────────────────────────────────────
// Validate
// ─────────────────────────────────────────────────────────────────────────────

if (!existsSync(TEMPLATE_DIR)) {
	p.cancel(`Template directory not found: ${TEMPLATE_DIR}`)
	process.exit(1)
}

if (existsSync(targetDir)) {
	p.cancel(`Directory already exists: ${targetDir}`)
	process.exit(1)
}

// ─────────────────────────────────────────────────────────────────────────────
// Create package
// ─────────────────────────────────────────────────────────────────────────────

const s = p.spinner()

s.start('Creating package')

// Ensure parent directory exists (for packages/clients/)
if (!existsSync(packagesDir)) {
	await $`mkdir -p ${packagesDir}`.quiet()
}

// Copy template
await $`cp -r ${TEMPLATE_DIR} ${targetDir}`.quiet()

const templatePkgPath = join(targetDir, 'package.json.template')
const pkgPath = join(targetDir, 'package.json')

if (existsSync(templatePkgPath)) {
	await $`mv ${templatePkgPath} ${pkgPath}`.quiet()
}

// Replace placeholders
const filesToProcess = ['package.json', 'README.md', 'src/index.ts']

for (const file of filesToProcess) {
	const filePath = join(targetDir, file)

	if (existsSync(filePath)) {
		let content = await Bun.file(filePath).text()
		content = content.replaceAll('{{name}}', packageName)
		await Bun.write(filePath, content)
	}
}

// Generate .oxlintrc.json with correct relative path depth
const depth = targetDir.split('/').length
const relativeRoot = '../'.repeat(depth)
const oxlintConfig = {
	$schema: `${relativeRoot}node_modules/oxlint/configuration_schema.json`,
	extends: [`${relativeRoot}.oxlintrc.json`],
}
await Bun.write(join(targetDir, '.oxlintrc.json'), JSON.stringify(oxlintConfig, null, '\t') + '\n')

s.stop('Package created')

// ─────────────────────────────────────────────────────────────────────────────
// Update root tsconfig references
// ─────────────────────────────────────────────────────────────────────────────

const rootTsConfigPath = 'tsconfig.json'

if (existsSync(rootTsConfigPath)) {
	try {
		const content = await Bun.file(rootTsConfigPath).text()
		const config = JSON.parse(content)

		if (Array.isArray(config.references)) {
			const newRef = { path: targetDir }
			const exists = config.references.some((ref: { path: string }) => ref.path === targetDir)

			if (!exists) {
				config.references.push(newRef)
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

p.note(`cd ${targetDir}\nbun install\nbun run build`, 'Next steps')

p.outro(`Created ${packageName}`)
