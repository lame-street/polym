import { WebSocket } from 'partysocket'

import { WS_URLS } from '../../constants'
import { ConditionId, TokenId } from '../../types/ids'
import { marketMessageWireSchema } from '../../types/wire/ws-market'

import type {
	MarketMessage,
	MarketWebSocketOptions,
	WebSocketHandle,
} from '../../types/domain/websocket'

/**
 * Ping interval in milliseconds.
 * Polymarket recommends sending pings to keep the connection alive.
 */
const PING_INTERVAL_MS = 50_000

/**
 * Decode market message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
function decodeMarketMessage(
	wire: ReturnType<typeof marketMessageWireSchema.parse>,
): MarketMessage {
	return wire.map(update => ({
		market: ConditionId(update.market),
		asset_id: TokenId(update.asset_id),
		hash: update.hash,
		timestamp: update.timestamp,
		bids: update.bids,
		asks: update.asks,
	}))
}

/**
 * Connect to the public market websocket and subscribe to token updates.
 *
 * Receives real-time order book updates, price changes, and trades for
 * the specified tokens. No authentication required.
 *
 * @param options - Connection options including token IDs and handlers
 * @returns WebSocket handle for managing the connection
 */
export function connectPublicMarketWebSocket(options: MarketWebSocketOptions): WebSocketHandle {
	const { tokenIds, onMessage, onError, onClose } = options

	const ws = new WebSocket(WS_URLS.market)

	let pingInterval: ReturnType<typeof setInterval> | null = null

	ws.addEventListener('open', () => {
		const subscriptionMessage = { assets_ids: tokenIds }
		ws.send(JSON.stringify(subscriptionMessage))

		pingInterval = setInterval(() => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send('PING')
			}
		}, PING_INTERVAL_MS)
	})

	ws.addEventListener('message', event => {
		if (event.data === 'PONG') return

		try {
			const parsed = JSON.parse(event.data as string) as unknown
			const result = marketMessageWireSchema.safeParse(parsed)

			if (result.success) {
				onMessage(decodeMarketMessage(result.data))
			}
		} catch {
			// Ignore non-JSON messages (e.g., PONG)
		}
	})

	ws.addEventListener('error', event => {
		onError?.(new Error(`WebSocket error: ${String(event)}`))
	})

	ws.addEventListener('close', () => {
		if (pingInterval) {
			clearInterval(pingInterval)
			pingInterval = null
		}
		onClose?.()
	})

	return {
		close: () => {
			if (pingInterval) {
				clearInterval(pingInterval)
				pingInterval = null
			}
			ws.close()
		},
		isOpen: () => ws.readyState === WebSocket.OPEN,
	}
}
