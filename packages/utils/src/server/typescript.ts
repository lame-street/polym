import { $ } from 'bun'

import { TYPESCRIPT_PACKAGE } from '@polym/constants'

import type { GenerateTypesOptions, GenerateTypesResult } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate TypeScript declaration files using tsc.
 * Runs `tsc --emitDeclarationOnly --declaration`.
 *
 * Use this alongside bundlers (Bun, esbuild, rolldown) which don't emit .d.ts files.
 *
 * @param options - Options for generating types
 * @returns Promise resolving to the generation result
 *
 * @example
 * // Basic usage
 * await generateTypes()
 *
 * // Custom tsconfig
 * await generateTypes({ tsconfig: 'tsconfig.types.json' })
 *
 * // With working directory
 * await generateTypes({ cwd: './packages/my-lib' })
 */
export async function generateTypes(
	options: GenerateTypesOptions = {},
): Promise<GenerateTypesResult> {
	const { tsconfig = 'tsconfig.json', cwd } = options

	const cmd =
		$`bunx ${TYPESCRIPT_PACKAGE} --project ${tsconfig} --emitDeclarationOnly --declaration`.nothrow()
	const proc = cwd ? cmd.cwd(cwd) : cmd
	const result = await proc.quiet()

	return {
		success: result.exitCode === 0,
		exitCode: result.exitCode,
		stdout: result.stdout.toString(),
		stderr: result.stderr.toString(),
	}
}
