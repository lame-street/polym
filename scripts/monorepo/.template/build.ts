#!/usr/bin/env bun
import { $ } from 'bun'

import { generateTypes, runStep } from '@timeback/internal-utils/server'

const startTime = performance.now()

// ─────────────────────────────────────────────────────────────────────────────
// Clean
// ─────────────────────────────────────────────────────────────────────────────

await runStep('Cleaning dist...', () => $`rm -rf dist`.quiet(), 'Cleaned dist')

// ─────────────────────────────────────────────────────────────────────────────
// Bundle
// ─────────────────────────────────────────────────────────────────────────────

await runStep(
	'Bundling with Bun...',
	async () => {
		const result = await Bun.build({
			entrypoints: ['./src/index.ts'],
			outdir: './dist',
			target: 'node',
			format: 'esm',
		})

		if (!result.success) {
			throw new Error(result.logs.join('\n'))
		}

		return result
	},
	'Bundled',
)

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

await runStep(
	'Generating types...',
	async () => {
		const result = await generateTypes({ tsconfig: 'tsconfig.build.json' })

		if (!result.success) {
			console.error('\n' + result.stdout)
			throw new Error('Type generation failed')
		}

		return result
	},
	'Generated types',
)

// ─────────────────────────────────────────────────────────────────────────────
// Done
// ─────────────────────────────────────────────────────────────────────────────

const duration = ((performance.now() - startTime) / 1000).toFixed(2)
await runStep(`Build complete in ${duration}s!`)
