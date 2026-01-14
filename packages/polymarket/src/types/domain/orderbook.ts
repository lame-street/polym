/**
 * Order book domain types.
 */

/**
 * Order book entry (bid or ask).
 */
export interface OrderBookEntry {
	price: number
	size: number
}

/**
 * Order book for a market token.
 */
export interface OrderBook {
	bids: OrderBookEntry[]
	asks: OrderBookEntry[]
}
