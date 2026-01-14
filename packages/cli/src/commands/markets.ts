import { log } from '@polym/utils/server'

import { intro, outro } from '../lib'

/**
 * Fetch and display market data.
 */
export function runMarketsSnapshot(): void {
	intro('Market Snapshot')

	log.warn('Not implemented yet')
	log.message('')
	log.info('This command will fetch market data to help you:')
	log.step('Browse available markets')
	log.step('Get token IDs and condition IDs for config')
	log.step('See current spreads and rewards')

	outro.info('See packages/polymarket/src/client.ts')
}
