/**
 * Position domain types.
 */

import type { TokenId } from '../ids'

/**
 * Position in a market.
 */
export interface Position {
	tokenId: TokenId
	size: number
	avgPrice: number
}
