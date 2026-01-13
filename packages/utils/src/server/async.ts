import { runStep } from './run-step'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Step {
	text: string
	action: () => Promise<unknown>
	successText?: string | ((result: unknown) => string)
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builder for running multiple steps with shared error handling.
 * Thenable — just `await` it directly, no `.run()` needed.
 *
 * @example
 * await steps()
 *     .add('Bumping version...', () => bump(), 'Version bumped')
 *     .add('Building...', () => build(), 'Built')
 *     .add('Publishing...', () => publish(), 'Published')
 *     .onError(() => rollback())
 */
class StepBuilder implements PromiseLike<void> {
	private _steps: Step[] = []
	private _onError?: () => Promise<void>

	/**
	 * Add a step to the sequence.
	 * @param text - Step description
	 * @param action - Async function to execute
	 * @param successText - Success message or function
	 * @returns This builder for chaining
	 */
	add(
		text: string,
		action: () => Promise<unknown>,
		successText?: string | ((result: unknown) => string),
	): this {
		this._steps.push({ text, action, successText })
		return this
	}

	/**
	 * Set error handler that runs if any step fails.
	 * The original error is re-thrown after the handler runs.
	 * @param handler - Async function to run on error
	 * @returns This builder for chaining
	 */
	onError(handler: () => Promise<void>): this {
		this._onError = handler
		return this
	}

	/**
	 * Makes the builder thenable — await triggers execution.
	 * @param onfulfilled - Success handler
	 * @param onrejected - Error handler
	 * @returns Promise
	 */
	// oxlint-disable-next-line no-thenable
	then<TResult1 = void, TResult2 = never>(
		onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
	): Promise<TResult1 | TResult2> {
		return this.execute().then(onfulfilled, onrejected)
	}

	private async execute(): Promise<void> {
		try {
			for (const step of this._steps) {
				await runStep(step.text, step.action, step.successText as string | undefined)
			}
		} catch (error) {
			if (this._onError) {
				await this._onError()
			}
			throw error
		}
	}
}

/**
 * Create a step builder for running multiple steps with shared error handling.
 *
 * @returns Step builder for chaining steps
 *
 * @example
 * await steps()
 *     .add('Step 1...', () => doStep1(), 'Done')
 *     .add('Step 2...', () => doStep2(), 'Done')
 *     .onError(() => cleanup())
 */
export function steps(): StepBuilder {
	return new StepBuilder()
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple Rollback Pattern
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute an action with automatic rollback on failure.
 * If the action throws, the cleanup function is called before re-throwing.
 *
 * @param action - The async action to perform
 * @param cleanup - Cleanup function to run on error
 * @returns Promise resolving to action result
 * @example
 * await withRollback(
 *     async () => {
 *         await setPackageVersion('1.2.3')
 *         await publish()
 *     },
 *     async () => {
 *         await setPackageVersion(originalVersion)
 *     },
 * )
 */
export async function withRollback<T>(
	action: () => Promise<T>,
	cleanup: () => Promise<void>,
): Promise<T> {
	try {
		return await action()
	} catch (error) {
		await cleanup()
		throw error
	}
}
