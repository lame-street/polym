import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		index: './src/index.ts',
		'rest/index': './src/lib/rest/index.ts',
		'ws/index': './src/lib/ws/index.ts',
		'rtds/index': './src/lib/rtds/index.ts',
		'types/index': './src/types/index.ts',
	},
	format: 'esm',
	dts: true,
})
