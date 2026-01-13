import { $ } from 'bun'

import { isCancel, select } from '@clack/prompts'

import type { BumpType } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Prompts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prompt user to select a version bump type interactively.
 * Exits the process if user cancels (Ctrl+C).
 * @returns The selected bump type
 */
export async function promptForBumpType(): Promise<BumpType> {
	const result = await select({
		message: 'Select version bump type:',
		options: [
			{ value: 'patch', label: 'Patch', hint: 'bug fixes' },
			{ value: 'minor', label: 'Minor', hint: 'new features' },
			{ value: 'major', label: 'Major', hint: 'breaking changes' },
			{ value: 'alpha', label: 'Alpha', hint: 'early testing' },
		],
	})

	if (isCancel(result)) {
		process.exit(0)
	}

	return result as BumpType
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI Parsing
// ─────────────────────────────────────────────────────────────────────────────

const BUMP_FLAGS: Record<string, BumpType> = {
	'--patch': 'patch',
	'--minor': 'minor',
	'--major': 'major',
	'--alpha': 'alpha',
}

/**
 * Parse bump type from CLI arguments.
 * Returns null if no bump flag is found.
 *
 * @param args - CLI argument array
 * @returns The bump type if found, null otherwise
 * @example
 * parseBumpTypeFromArgs(['--patch'])  // 'patch'
 * parseBumpTypeFromArgs(['--alpha'])  // 'alpha'
 * parseBumpTypeFromArgs([])           // null
 */
export function parseBumpTypeFromArgs(args: string[]): BumpType | null {
	for (const arg of args) {
		const bump = BUMP_FLAGS[arg]
		if (bump) return bump
	}
	return null
}

/**
 * Get bump type from CLI args, falling back to interactive prompt.
 * Convenience wrapper that combines parseBumpTypeFromArgs + promptForBumpType.
 *
 * @param args - CLI argument array
 * @returns The bump type
 * @example
 * const bumpType = await getBumpType(process.argv.slice(2))
 */
export async function getBumpType(args: string[]): Promise<BumpType> {
	return parseBumpTypeFromArgs(args) ?? (await promptForBumpType())
}

// ─────────────────────────────────────────────────────────────────────────────
// Alpha Version Calculation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the next alpha version for a package.
 * Queries npm registry to find the latest alpha and increments.
 *
 * @param packageName - The package name to query
 * @param currentVersion - The current version
 * @returns The next alpha version string
 * @example
 * // If latest alpha is 1.2.3-alpha.5, returns "1.2.3-alpha.6"
 * // If no alpha exists for current version, returns "1.2.3-alpha.1"
 * await getNextAlphaVersion('my-package', '1.2.3')
 */
export async function getNextAlphaVersion(
	packageName: string,
	currentVersion: string,
): Promise<string> {
	let alphaNum = 0

	try {
		const latestAlpha = (await $`bun pm view ${packageName}@alpha version`.text()).trim()

		if (latestAlpha.startsWith(`${currentVersion}-alpha.`)) {
			const match = latestAlpha.match(/-alpha\.(\d+)$/)
			if (match?.[1]) {
				alphaNum = parseInt(match[1], 10)
			}
		}
	} catch {
		// No alpha version exists yet, or error querying npm — start at 0
	}

	return `${currentVersion}-alpha.${alphaNum + 1}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Version String Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a version string is an alpha/prerelease version.
 *
 * @param version - The version string to check
 * @returns True if version is an alpha version
 * @example
 * isAlphaVersion('1.2.3-alpha.1')  // true
 * isAlphaVersion('1.2.3')          // false
 */
export function isAlphaVersion(version: string): boolean {
	return version.includes('-alpha.')
}

/**
 * Extract the base version from an alpha version string.
 *
 * @param version - The version string
 * @returns The base version without alpha suffix
 * @example
 * getBaseVersion('1.2.3-alpha.5')  // '1.2.3'
 * getBaseVersion('1.2.3')          // '1.2.3'
 */
export function getBaseVersion(version: string): string {
	return version.split('-')[0] ?? version
}

/**
 * Bump a semver version string by the specified type.
 *
 * @param version - The version string to bump
 * @param type - The type of bump (patch, minor, or major)
 * @returns The bumped version string
 *
 * @example
 * bumpVersion('1.2.3', 'patch')  // '1.2.4'
 * bumpVersion('1.2.3', 'minor')  // '1.3.0'
 * bumpVersion('1.2.3', 'major')  // '2.0.0'
 */
export function bumpVersion(version: string, type: 'patch' | 'minor' | 'major'): string {
	const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)

	switch (type) {
		case 'major':
			return `${major + 1}.0.0`
		case 'minor':
			return `${major}.${minor + 1}.0`
		case 'patch':
			return `${major}.${minor}.${patch + 1}`
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Package Version Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Set package version using bumpp.
 * Updates package.json without creating git tags/commits.
 *
 * @param version - Exact version string or bump type (patch/minor/major)
 * @returns The new version string from package.json
 *
 * @example
 * await setPackageVersion('1.2.3')          // Set exact version
 * await setPackageVersion('patch')          // Bump patch
 * await setPackageVersion('1.0.0-alpha.1')  // Set prerelease
 */
export async function setPackageVersion(version: string): Promise<string> {
	await $`bunx bumpp ${version} --no-tag --no-push --no-commit --yes`.quiet()
	const pkg = await Bun.file('./package.json').json()
	return pkg.version
}
