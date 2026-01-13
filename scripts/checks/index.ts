#!/usr/bin/env bun
/**
 * Run all code quality checks across the monorepo.
 *
 * Checks: TypeScript, linting, JSDoc, type locations.
 */
import { $ } from 'bun'

import { TYPESCRIPT_PACKAGE } from '@polym/constants'
import { runStep } from '@polym/utils/server'

try {
	await runStep(
		'Running type check',
		() => $`bunx ${TYPESCRIPT_PACKAGE} --build --noEmit ${process.argv.slice(2)}`.quiet(),
		'Type check complete',
	)

	await runStep('Running lint check', () => $`bun run lint`.quiet(), 'Lint check complete')

	await runStep(
		'Running JSDoc check',
		() => $`bun scripts/checks/check-jsdoc.ts`.quiet(),
		'JSDoc check complete',
	)

	await runStep(
		'Ensuring type locations',
		() => $`bun scripts/checks/check-type-locations.ts`.quiet(),
		'Type locations ensured',
	)
} catch {
	console.error('Checks failed')
	console.error('')
	console.error('Please fix the errors and run `bun check` again.')
	console.error('Note: run `bun check` with "all" permissions to ensure success.')
	process.exit(1)
}
