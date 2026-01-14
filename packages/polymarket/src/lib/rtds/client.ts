import { ConnectionStatus, RealTimeDataClient } from '@polymarket/real-time-data-client'

import { tryDecodeRtdsMessage } from '../../types/codecs/rtds'
import { rtdsMessageBaseWireSchema } from '../../types/wire/rtds'

import type { Message, SubscriptionMessage } from '@polymarket/real-time-data-client'
import type {
	RtdsSubscription,
	RtdsWebSocketHandle,
	RtdsWebSocketOptions,
} from '../../types/domain/websocket'
import type { TokenId } from '../../types/ids'

export { ConnectionStatus, type Message, type SubscriptionMessage }

/**
 * Convert our subscription format to the official RTDS client format.
 *
 * @param subs - Subscriptions to convert
 * @returns Subscription message for the RTDS client
 */
function toSubscriptionMessage(subs: RtdsSubscription[]): SubscriptionMessage {
	return {
		subscriptions: subs.map(sub => ({
			topic: sub.topic,
			type: sub.type ?? '*',
			filters: sub.filters,
			clob_auth: sub.clob_auth,
			gamma_auth: sub.gamma_auth,
		})),
	}
}

/**
 * Connect to the Polymarket Real-Time Data Socket (RTDS).
 *
 * @param options - Connection options including subscriptions and handlers
 * @returns WebSocket-like handle with subscription management
 */
export function connectRtds(
	options: RtdsWebSocketOptions & {
		onStatusChange?: (status: ConnectionStatus) => void
	},
): RtdsWebSocketHandle {
	const { subscriptions, onMessage, onClose, onStatusChange } = options

	const client = new RealTimeDataClient({
		onConnect: c => {
			if (subscriptions.length > 0) {
				c.subscribe(toSubscriptionMessage(subscriptions))
			}
		},
		onMessage: (_client, message) => {
			const baseResult = rtdsMessageBaseWireSchema.safeParse(message)
			if (!baseResult.success) return

			const decoded = tryDecodeRtdsMessage(baseResult.data)
			if (decoded) onMessage(decoded)
		},
		onStatusChange: status => {
			onStatusChange?.(status)
			if (status === ConnectionStatus.DISCONNECTED) {
				onClose?.()
			}
		},
		autoReconnect: true,
	})

	client.connect()

	return {
		close: () => client.disconnect(),
		isOpen: () => true,
		subscribe: subs => client.subscribe(toSubscriptionMessage(subs)),
		unsubscribe: subs => client.unsubscribe(toSubscriptionMessage(subs)),
	}
}

/**
 * Create a subscription for Binance crypto prices.
 *
 * @param symbol - Optional symbol filter (e.g., "BTCUSDT"). Use uppercase.
 * @returns Subscription object
 */
export function cryptoPricesSubscription(symbol?: string): RtdsSubscription {
	return {
		topic: 'crypto_prices',
		type: 'update',
		filters: symbol ? JSON.stringify({ symbol: symbol.toUpperCase() }) : undefined,
	}
}

/**
 * Create a subscription for Chainlink oracle prices.
 *
 * @param symbol - Optional symbol filter (e.g., "eth/usd")
 * @returns Subscription object
 */
export function chainlinkPricesSubscription(symbol?: string): RtdsSubscription {
	return {
		topic: 'crypto_prices_chainlink',
		type: '*',
		filters: symbol ? JSON.stringify({ symbol }) : '',
	}
}

/**
 * Create a subscription for equity/stock prices.
 *
 * @param symbol - Optional symbol filter (e.g., "AAPL", "TSLA")
 * @returns Subscription object
 */
export function equityPricesSubscription(symbol?: string): RtdsSubscription {
	return {
		topic: 'equity_prices',
		type: 'update',
		filters: symbol ? JSON.stringify({ symbol }) : undefined,
	}
}

/**
 * Create a subscription for comment events.
 *
 * @param type - Event type filter (default: all types with "*")
 * @returns Subscription object
 */
export function commentsSubscription(
	type?: 'comment_created' | 'comment_removed' | 'reaction_created' | 'reaction_removed' | '*',
): RtdsSubscription {
	return {
		topic: 'comments',
		type: type ?? '*',
	}
}

/**
 * Create a subscription for trade activity.
 *
 * @returns Subscription object
 */
export function activitySubscription(): RtdsSubscription {
	return {
		topic: 'activity',
		type: '*',
	}
}

/**
 * Create a subscription for CLOB market order book updates.
 *
 * @param tokenIds - Token IDs to watch
 * @returns Subscription object
 */
export function clobMarketSubscription(tokenIds: TokenId[]): RtdsSubscription {
	return {
		topic: 'clob_market',
		type: '*',
		filters: JSON.stringify(tokenIds),
	}
}
