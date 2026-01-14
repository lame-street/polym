/**
 * Order domain types.
 */

import type { OrderId, TokenId } from '../ids'

/**
 * Order side.
 */
export type Side = 'BUY' | 'SELL'

/**
 * Open order.
 */
export interface Order {
	id: OrderId
	tokenId: TokenId
	side: Side
	price: number
	originalSize: number
	sizeMatched: number
}

/**
 * Result of placing an order.
 */
export interface OrderResult {
	success: boolean
	orderId?: OrderId
	error?: string
}
