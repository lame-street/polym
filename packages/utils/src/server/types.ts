/**
 * Server Utility Types
 *
 * Shared types for server-side utilities.
 */

// ─────────────────────────────────────────────────────────────────────────────
// File System
// ─────────────────────────────────────────────────────────────────────────────

export interface FindUpOptions {
	/** Directory to start searching from (defaults to process.cwd()) */
	cwd?: string
	/** Maximum parent directories to search (default: 10) */
	maxDepth?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Package Management
// ─────────────────────────────────────────────────────────────────────────────

export interface PackageJson {
	name: string
	version: string
	private?: boolean
	type?: 'module' | 'commonjs'
	main?: string
	module?: string
	types?: string
	exports?: Record<string, unknown>
	scripts?: Record<string, string>
	dependencies?: Record<string, string>
	devDependencies?: Record<string, string>
	peerDependencies?: Record<string, string>
	[key: string]: unknown
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Execution
// ─────────────────────────────────────────────────────────────────────────────

export interface RunStepOptions {
	/**
	 * When true, the spinner line is cleared on success instead of showing
	 * a success message. Useful when the action produces its own output.
	 */
	replace?: boolean
}

export interface StepConfig<T = unknown> {
	text: string
	action: () => Promise<T>
	successText?: string | ((result: T) => string)
}

export interface StepResult<T = unknown> {
	success: boolean
	result?: T
	error?: unknown
}

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Generation
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateTypesOptions {
	/** Path to tsconfig.json (default: 'tsconfig.json') */
	tsconfig?: string
	/** Working directory */
	cwd?: string
}

export interface GenerateTypesResult {
	success: boolean
	exitCode: number
	stdout: string
	stderr: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Version Management
// ─────────────────────────────────────────────────────────────────────────────

export type BumpType = 'patch' | 'minor' | 'major' | 'alpha'

// ─────────────────────────────────────────────────────────────────────────────
// File Discovery
// ─────────────────────────────────────────────────────────────────────────────

export interface GetSourceFilesOptions {
	/** Directory to search in (default: 'packages/') */
	directory?: string
	/** Additional filter to exclude files */
	exclude?: (filePath: string) => boolean
}
