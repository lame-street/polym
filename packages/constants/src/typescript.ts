/**
 * TypeScript tooling configuration.
 *
 * Centralizes the TypeScript package used for type checking across the monorepo.
 * Change TYPESCRIPT_PACKAGE to switch implementations.
 */

export const TypeScriptPackages = {
	tsc: 'tsc',
	nativePreview: '@typescript/native-preview@7.0.0-dev.20251217.1',
} as const

/**
 * The TypeScript package used for type checking.
 *
 * @see `https://www.npmjs.com/package/@typescript/native-preview`
 */
export const TYPESCRIPT_PACKAGE: (typeof TypeScriptPackages)[keyof typeof TypeScriptPackages] =
	TypeScriptPackages.nativePreview
