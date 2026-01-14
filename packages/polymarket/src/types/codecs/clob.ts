/**
 * CLOB API codecs - wire to domain conversion.
 */

import { OrderId, TokenId } from '../ids'

import type { OrderBook, OrderBookEntry } from '../domain/orderbook'
import type { Order } from '../domain/orders'
import type { OpenOrderWire, OrderbookEntryWire, OrderbookWire } from '../wire/clob-rest'

/**
 * Decode an orderbook entry wire to domain type.
 *
 * @param wire - Raw orderbook entry
 * @returns Parsed orderbook entry
 */
export function decodeOrderbookEntry(wire: OrderbookEntryWire): OrderBookEntry {
	return {
		price: Number(wire.price),
		size: Number(wire.size),
	}
}

/**
 * Decode an orderbook wire response to domain type.
 *
 * @param wire - Raw orderbook from API
 * @returns Parsed orderbook
 */
export function decodeOrderbook(wire: OrderbookWire): OrderBook {
	return {
		bids: wire.bids.map(decodeOrderbookEntry),
		asks: wire.asks.map(decodeOrderbookEntry),
	}
}

/**
 * Decode an open order wire to domain type.
 *
 * @param wire - Raw order from API
 * @returns Parsed order
 */
export function decodeOrder(wire: OpenOrderWire): Order {
	return {
		id: OrderId(wire.id),
		tokenId: TokenId(wire.asset_id),
		side: wire.side,
		price: Number(wire.price),
		originalSize: Number(wire.original_size),
		sizeMatched: Number(wire.size_matched),
	}
}

/**
 * Decode an array of open order wires to domain types.
 *
 * @param wires - Array of raw orders from API
 * @returns Array of parsed orders
 */
export function decodeOrders(wires: OpenOrderWire[]): Order[] {
	return wires.map(decodeOrder)
}
