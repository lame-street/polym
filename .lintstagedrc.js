export default {
	'*.{js,jsx,ts,tsx,svelte}': ['oxlint', 'prettier'],
	'**/package.json': ['bunx sort-package-json', 'prettier'],
	'*.{json,md,yml}': ['prettier'],
}
