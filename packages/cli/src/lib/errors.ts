import { red } from 'colorette'

import { ConfigError, EnvError } from '@polym/config'
import { cancel, hl, log } from '@polym/utils/server'

/**
 * Handle errors with nice CLI output.
 *
 * @param error - The error to handle
 */
export function handleError(error: unknown): never {
	log.message('')

	if (error instanceof EnvError) {
		const label = error.varNames.length > 1 ? 'variables' : 'variable'
		cancel(
			red(`Missing environment ${label}: ${error.varNames.map(n => hl.key(n)).join(', ')}`),
		)
		process.exit(1)
	}

	if (error instanceof ConfigError) {
		cancel(red(error.message.endsWith('.') ? error.message.slice(0, -1) : `${error.message}`))
		process.exit(1)
	}

	if (error instanceof Error) {
		cancel(red(error.message))
		process.exit(1)
	}

	cancel(red('An unexpected error occurred'))
	process.exit(1)
}
