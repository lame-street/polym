import * as p from '@clack/prompts'

import { requireEnv } from '@polym/config'
import { PolymarketClient } from '@polym/sdk'
import { log } from '@polym/utils/server'

import { intro, outro } from '../lib'

/**
 * Display account statistics.
 */
export async function runAccountStats(): Promise<void> {
	intro('Account Statistics')

	const s = p.spinner()

	const client = new PolymarketClient({
		privateKey: requireEnv('PK'),
		walletAddress: requireEnv('BROWSER_ADDRESS'),
	})

	try {
		s.start('Fetching account data')
		const [usdcBalance, positionValue, positions] = await Promise.all([
			client.getUsdcBalance(),
			client.getPositionValue(),
			client.getAllPositions(),
		])
		s.stop('Data loaded')

		log.info(`USDC Balance:   $${usdcBalance.toFixed(2)}`)
		log.info(`Position Value: $${positionValue.toFixed(2)}`)
		log.info(`Total Value:    $${(usdcBalance + positionValue).toFixed(2)}`)
		log.info(`Open Positions: ${positions.length}`)

		if (positions.length > 0) {
			log.message('')
			for (const pos of positions) {
				log.step(`${pos.tokenId}: ${pos.size} @ $${pos.avgPrice.toFixed(4)}`)
			}
		}

		outro.success()
	} catch (error) {
		if (error instanceof Error && error.message.includes('Not implemented')) {
			s.stop('Not implemented yet')
			log.warn('Account stats require implementing PolymarketClient methods')
			outro.info('See packages/polymarket/src/client.ts')
		} else {
			throw error
		}
	}
}
