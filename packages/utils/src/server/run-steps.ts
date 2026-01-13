import { bold, dim } from 'colorette'

import { Spinner } from './spinner'

import type { StepConfig, StepResult } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run multiple steps in parallel with a shared spinner.
 * All steps start immediately and run concurrently.
 *
 * @param steps - Object mapping step names to step configurations
 * @returns Results for each step, keyed by the step name
 * @throws If any step fails (after all steps complete)
 *
 * @example
 * await runSteps({
 *     buildDir: {
 *         text: 'Removing build directory...',
 *         action: () => $`rm -rf dist`.quiet(),
 *         successText: 'Removed build directory',
 *     },
 *     nodeModules: {
 *         text: 'Removing node_modules...',
 *         action: () => $`rm -rf node_modules`.quiet(),
 *         successText: 'Removed node_modules',
 *     },
 * })
 */
export async function runSteps<T extends Record<string, StepConfig>>(
	steps: T,
): Promise<{ [K in keyof T]: StepResult<Awaited<ReturnType<T[K]['action']>>> }> {
	const keys = Object.keys(steps) as (keyof T)[]
	const results = {} as { [K in keyof T]: StepResult<Awaited<ReturnType<T[K]['action']>>> }

	// Create a single spinner for all tasks
	const taskTexts = keys.map(key => steps[key]!.text)
	const spinner = new Spinner(keys as string[], taskTexts)

	spinner.start()

	// Run all steps in parallel
	const promises = keys.map(async key => {
		const step = steps[key]!
		const startTime = performance.now()

		spinner.updateTask(key as string, 'running')

		try {
			const result = await step.action()
			const duration = performance.now() - startTime

			// Build success text
			let finalText: string
			if (typeof step.successText === 'function') {
				finalText = step.successText(result as Awaited<ReturnType<T[typeof key]['action']>>)
			} else {
				finalText = step.successText ?? step.text
			}

			finalText = `${bold(finalText)} ${formatDuration(duration)}`

			spinner.updateTask(key as string, 'success', finalText)
			results[key] = {
				success: true,
				result: result as Awaited<ReturnType<T[typeof key]['action']>>,
			}
		} catch (error) {
			spinner.updateTask(key as string, 'error')
			results[key] = { success: false, error }
		}
	})

	await Promise.all(promises)
	spinner.stop()

	// Check for failures
	const failedSteps = keys.filter(key => !results[key].success)

	if (failedSteps.length > 0) {
		console.error('')
		console.error(bold('The following steps failed:'))

		for (const key of failedSteps) {
			const error = results[key].error
			console.error(`\n  ${String(key)}:`)

			if (isShellError(error)) {
				console.error(`    Exit Code: ${error.exitCode}`)
				const stdout = error.stdout?.toString().trim()
				const stderr = error.stderr?.toString().trim()
				if (stdout) console.error(`    Stdout:\n${indentLines(stdout, 6)}`)
				if (stderr) console.error(`    Stderr:\n${indentLines(stderr, 6)}`)
			} else {
				const message = error instanceof Error ? error.message : String(error)
				console.error(`    Error: ${message}`)
			}
		}

		console.error('')
		throw new Error(`${failedSteps.length} step(s) failed: ${failedSteps.join(', ')}`)
	}

	return results
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format duration in milliseconds to a human-readable string.
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "[1.23s]" or "[500ms]")
 */
function formatDuration(ms: number): string {
	if (ms >= 1000) {
		return dim(`[${(ms / 1000).toFixed(2)}s]`)
	}
	return dim(`[${Math.round(ms)}ms]`)
}

/**
 * Indent each line of a string with the specified number of spaces.
 *
 * @param str - The string to indent
 * @param spaces - Number of spaces to indent
 * @returns The indented string
 */
function indentLines(str: string, spaces: number): string {
	const indent = ' '.repeat(spaces)
	return str
		.split('\n')
		.map(line => `${indent}${line}`)
		.join('\n')
}

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
