/** @type {import('prettier').Config} */
export default {
	overrides: [
		{
			/**
			 * Make sure JSON files don't complain about trailing commas
			 */
			files: ['**/*.{json,jsonc}'],
			options: {
				trailingComma: 'none',
			},
		},
	],
}
