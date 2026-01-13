// @ts-check

import base from './.prettier/base.js'
import overrides from './.prettier/overrides.js'
import sortImports from './.prettier/sort-imports.js'

export default {
	...base,
	...overrides,
	...sortImports,
}
