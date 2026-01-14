import { CLOB_API_HOST } from '../../../constants'
import { decodeOrderbook } from '../../../types/codecs/clob'
import {
	midpointWireSchema,
	orderbookWireSchema,
	priceWireSchema,
	spreadWireSchema,
} from '../../../types/wire/clob-rest'

import type { OrderBook } from '../../../types/domain/orderbook'
import type { Side } from '../../../types/domain/orders'
import type { TokenId } from '../../../types/ids'

/**
 * Public (unauthenticated) client for the CLOB API (REST).
 *
 * Provides read-only access to order books, prices, spreads, and midpoints.
 * No API credentials required.
 *
 * @see https://docs.polymarket.com/developers/CLOB/rest-api
 */
export class ClobPublicClient {
	private readonly host: string

	/**
	 * Create a new CLOB public client.
	 *
	 * @param options - Optional configuration
	 */
	constructor(options?: { host?: string }) {
		this.host = options?.host ?? CLOB_API_HOST
	}

	/**
	 * Get the order book for a token.
	 *
	 * @param tokenId - Token ID to fetch
	 * @returns The order book with bids and asks
	 */
	async getOrderBook(tokenId: TokenId): Promise<OrderBook> {
		const url = new URL('/book', this.host)
		url.searchParams.set('token_id', tokenId)

		const res = await fetch(url)
		if (!res.ok) {
			throw new Error(`Failed to fetch order book (${res.status})`)
		}

		const wire = orderbookWireSchema.parse(await res.json())
		return decodeOrderbook(wire)
	}

	/**
	 * Get the midpoint price for a token.
	 *
	 * @param tokenId - Token ID to fetch
	 * @returns The midpoint price
	 */
	async getMidpoint(tokenId: TokenId): Promise<number> {
		const url = new URL('/midpoint', this.host)
		url.searchParams.set('token_id', tokenId)

		const res = await fetch(url)
		if (!res.ok) {
			throw new Error(`Failed to fetch midpoint (${res.status})`)
		}

		const wire = midpointWireSchema.parse(await res.json())
		return Number(wire.mid)
	}

	/**
	 * Get the current price for a token on a specific side.
	 *
	 * @param tokenId - Token ID to fetch
	 * @param side - 'BUY' or 'SELL'
	 * @returns The price
	 */
	async getPrice(tokenId: TokenId, side: Side): Promise<number> {
		const url = new URL('/price', this.host)
		url.searchParams.set('token_id', tokenId)
		url.searchParams.set('side', side)

		const res = await fetch(url)
		if (!res.ok) {
			throw new Error(`Failed to fetch price (${res.status})`)
		}

		const wire = priceWireSchema.parse(await res.json())
		return Number(wire.price)
	}

	/**
	 * Get the spread for a token.
	 *
	 * @param tokenId - Token ID to fetch
	 * @returns The spread (ask - bid)
	 */
	async getSpread(tokenId: TokenId): Promise<number> {
		const url = new URL('/spread', this.host)
		url.searchParams.set('token_id', tokenId)

		const res = await fetch(url)
		if (!res.ok) {
			throw new Error(`Failed to fetch spread (${res.status})`)
		}

		const wire = spreadWireSchema.parse(await res.json())
		return Number(wire.spread)
	}
}

