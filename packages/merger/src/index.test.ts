import { expect, test } from 'bun:test'

import { mergePositions } from './index'

test('mergePositions throws not implemented', () => {
	expect(() =>
		mergePositions({
			amount: 1000,
			conditionId: 'cond-1',
			negRisk: false,
		}),
	).toThrow('Not implemented')
})
