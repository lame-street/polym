import { findMarketByToken, removePendingTrade } from './state'
import { evaluateStrategy } from './strategy'

import type {
	MarketBookUpdate,
	MarketMessage,
	OrderBook,
	PolymarketClient,
	UserMessage,
} from '@polym/sdk'
import type { EngineState } from '../types'

/**
 * Convert websocket book update to OrderBook domain type.
 *
 * @param update - Raw book update from websocket
 * @returns OrderBook with numeric values
 */
function toOrderBook(update: MarketBookUpdate): OrderBook {
	return {
		bids: update.bids.map(b => ({ price: Number(b.price), size: Number(b.size) })),
		asks: update.asks.map(a => ({ price: Number(a.price), size: Number(a.size) })),
	}
}

/**
 * Handle incoming market websocket message.
 * Updates order books and triggers trading decisions.
 *
 * @param state - Engine state
 * @param client - Polymarket client
 * @param message - Market message from websocket (array of book updates)
 */
export function handleMarketMessage(
	state: EngineState,
	client: PolymarketClient,
	message: MarketMessage,
): void {
	for (const update of message) {
		const market = findMarketByToken(state, update.asset_id)
		if (!market) continue

		const orderBook = toOrderBook(update)

		if (market.config.token1 === update.asset_id) {
			market.orderBook1 = orderBook
		} else {
			market.orderBook2 = orderBook
		}

		void evaluateStrategy(market, client, state.pendingTrades, state)
	}
}

/**
 * Handle incoming user websocket message.
 * Updates orders and positions.
 *
 * @param state - Engine state
 * @param message - User message from websocket
 */
export function handleUserMessage(state: EngineState, message: UserMessage): void {
	switch (message.type) {
		case 'order_placed': {
			const market = findMarketByToken(state, message.order.tokenId)
			if (!market) return

			if (market.config.token1 === message.order.tokenId) {
				market.orders1.push(message.order)
			} else {
				market.orders2.push(message.order)
			}
			break
		}

		case 'order_cancelled': {
			for (const market of state.markets.values()) {
				market.orders1 = market.orders1.filter(o => o.id !== message.orderId)
				market.orders2 = market.orders2.filter(o => o.id !== message.orderId)
			}
			break
		}

		case 'order_matched': {
			for (const market of state.markets.values()) {
				for (const order of [...market.orders1, ...market.orders2]) {
					if (order.id === message.orderId) {
						order.sizeMatched = message.sizeMatched
					}
				}
			}
			break
		}

		case 'trade': {
			const market = findMarketByToken(state, message.tokenId)
			if (!market) return

			const isToken1 = market.config.token1 === message.tokenId
			const position = isToken1 ? market.position1 : market.position2

			if (message.side === 'BUY') {
				// Increase position with weighted average price
				const oldSize = position?.size ?? 0
				const oldAvg = position?.avgPrice ?? 0
				const newSize = oldSize + message.size
				const newAvg =
					newSize > 0 ? (oldSize * oldAvg + message.size * message.price) / newSize : 0

				const updatedPosition = {
					tokenId: message.tokenId,
					size: newSize,
					avgPrice: newAvg,
				}

				if (isToken1) {
					market.position1 = updatedPosition
				} else {
					market.position2 = updatedPosition
				}
			} else {
				// Decrease position, keep avgPrice (or reset if size hits 0)
				const oldSize = position?.size ?? 0
				const oldAvg = position?.avgPrice ?? 0
				const newSize = Math.max(0, oldSize - message.size)

				const updatedPosition = {
					tokenId: message.tokenId,
					size: newSize,
					avgPrice: newSize > 0 ? oldAvg : 0,
				}

				if (isToken1) {
					market.position1 = updatedPosition
				} else {
					market.position2 = updatedPosition
				}
			}

			// Clear pending trade for this token
			removePendingTrade(state, message.tokenId)
			break
		}
	}
}
