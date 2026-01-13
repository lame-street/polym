import { bold, dim } from 'colorette'

import { Spinner } from './spinner'

import type { RunStepOptions } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run an action with a spinner and timing.
 *
 * Accepts both sync and async actions.
 *
 * @example
 * // Just log a message (no action)
 * await runStep('Done!')
 *
 * // Run a sync action with spinner
 * await runStep('Cleaning...', () => rmSync(dir, { recursive: true }), 'Cleaned')
 *
 * // Run an async action with spinner
 * await runStep('Building...', () => build(), 'Built successfully')
 *
 * // Dynamic success text based on result
 * await runStep('Fetching...', fetchData, result => `Fetched ${result.count} items`)
 *
 * // Clear spinner on success (subsequent output takes its place)
 * await runStep('Running command...', () => exec(), undefined, { replace: true })
 */
export async function runStep(text: string): Promise<void>
export async function runStep<T>(
	text: string,
	action: () => T | Promise<T>,
	successText?: string | ((result: T) => string),
	options?: RunStepOptions,
): Promise<T>
export async function runStep<T>(
	text: string,
	action?: () => T | Promise<T>,
	successText?: string | ((result: T) => string),
	options?: RunStepOptions,
): Promise<T | void> {
	const spinner = new Spinner(['task'], [text])

	if (!action) {
		spinner.start()
		spinner.updateTask('task', 'success', bold(text))
		spinner.stop()
		return
	}

	spinner.start()
	spinner.updateTask('task', 'running')
	const startTime = performance.now()

	try {
		const result = await action()

		if (options?.replace) {
			spinner.clear()
		} else {
			const finalText =
				typeof successText === 'function' ? successText(result) : (successText ?? text)
			spinner.updateTask('task', 'success', `${bold(finalText)} ${formatDuration(startTime)}`)
			spinner.stop()
		}

		return result
	} catch (error) {
		spinner.updateTask('task', 'error')
		spinner.stop()
		logError(error)
		throw error
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats elapsed time since startTime as a dimmed duration string.
 * @param startTime - Timestamp from performance.now()
 * @returns Formatted duration string
 */
function formatDuration(startTime: number): string {
	const ms = performance.now() - startTime
	const formatted = ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`
	return dim(`[${formatted}]`)
}

/**
 * Indents each line of a string.
 * @param str - The string to indent
 * @param spaces - Number of spaces to indent
 * @returns Indented string
 */
function indentLines(str: string, spaces = 4): string {
	const padding = ' '.repeat(spaces)
	return str
		.split('\n')
		.map(line => `${padding}${line}`)
		.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────────────────────

interface ShellError {
	exitCode: number
	stdout?: { toString(): string }
	stderr?: { toString(): string }
}

/**
 * Type guard to check if an error is a shell error with exit code.
 *
 * @param error - The error to check
 * @returns True if the error is a shell error
 */
function isShellError(error: unknown): error is ShellError {
	return (
		error !== null &&
		typeof error === 'object' &&
		'exitCode' in error &&
		typeof error.exitCode === 'number'
	)
}

/**
 * Logs detailed error information.
 * @param error - The error to log
 */
function logError(error: unknown): void {
	console.error('')

	if (isShellError(error)) {
		console.error(`  Exit Code: ${error.exitCode}`)
		const stdout = error.stdout?.toString().trim()
		const stderr = error.stderr?.toString().trim()
		if (stdout) console.error(`  Stdout:\n${indentLines(stdout)}`)
		if (stderr) console.error(`  Stderr:\n${indentLines(stderr)}`)
	} else {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`  Error: ${message}`)
	}

	console.error('')
}
