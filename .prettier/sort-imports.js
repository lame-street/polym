/** @type {import('prettier').Config} */
export default {
	plugins: ['@ianvs/prettier-plugin-sort-imports'],
	importOrderTypeScriptVersion: '5.0.0',
	importOrderCaseSensitive: false,
	importOrder: [
		'^bun',

		'',

		'<BUILTIN_MODULES>', // Node.js built-ins (fs, path, etc. or node:fs)

		'',

		// All third-party modules, including React, Lucide, etc.
		'<THIRD_PARTY_MODULES>',

		'',

		// Monorepo workspace packages (eg. @polym/*)
		'^@polym/(.*)$',

		// Aliased modules (eg. @/ or $/)
		'^[@$]/',

		'',

		// Relative imports
		'^[./]',

		'',

		// Type-only imports, following the same group order
		'<TYPES>^(node:)',
		'<TYPES>',
		'<TYPES>^@polym/(.*)$',
		'<TYPES>^[@$]/',
		'<TYPES>^[./]',
	],
}
