import { WebSocket } from 'partysocket'

import { WS_URLS } from '../../constants'
import { OrderId, TokenId } from '../../types/ids'
import { userMessageWireSchema } from '../../types/wire/ws-user'

import type { ApiCredentials } from '../../types/domain/client'
import type { Order } from '../../types/domain/orders'
import type {
	UserMessage,
	UserWebSocketOptions,
	WebSocketHandle,
} from '../../types/domain/websocket'
import type { UserMessageWire, UserOrderWire } from '../../types/wire/ws-user'

/**
 * Ping interval in milliseconds.
 * Polymarket recommends sending pings to keep the connection alive.
 */
const PING_INTERVAL_MS = 50_000

/**
 * Build the authentication message for the user websocket.
 *
 * @param credentials - API credentials
 * @returns The authentication message object
 */
function buildAuthMessage(credentials: ApiCredentials): object {
	return {
		type: 'user',
		auth: {
			apiKey: credentials.apiKey,
			secret: credentials.apiSecret,
			passphrase: credentials.apiPassphrase,
		},
	}
}

/**
 * Decode a user websocket order from wire format to domain format.
 *
 * @param wire - Wire order
 * @returns Domain order
 */
function decodeOrder(wire: UserOrderWire): Order {
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
 * Decode a user websocket message from wire format to domain format.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
function decodeUserMessage(wire: UserMessageWire): UserMessage {
	switch (wire.type) {
		case 'order_placed':
			return {
				type: 'order_placed',
				order: decodeOrder(wire.order),
			}
		case 'order_matched':
			return {
				type: 'order_matched',
				orderId: OrderId(wire.orderId),
				sizeMatched: Number(wire.sizeMatched),
			}
		case 'order_cancelled':
			return {
				type: 'order_cancelled',
				orderId: OrderId(wire.orderId),
			}
		case 'trade':
			return {
				type: 'trade',
				tokenId: TokenId(wire.tokenId),
				side: wire.side,
				price: Number(wire.price),
				size: Number(wire.size),
			}
	}
}

/**
 * Connect to the authenticated user websocket for order/trade updates.
 *
 * @param options - Connection options including credentials and handlers
 * @returns WebSocket handle for managing the connection
 */
export function connectClobUserWebSocket(options: UserWebSocketOptions): WebSocketHandle {
	const { credentials, onMessage, onError, onClose } = options

	const ws = new WebSocket(WS_URLS.user)

	let pingInterval: ReturnType<typeof setInterval> | null = null

	ws.addEventListener('open', () => {
		const authMessage = buildAuthMessage(credentials)
		ws.send(JSON.stringify(authMessage))

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
			const result = userMessageWireSchema.safeParse(parsed)

			if (result.success) {
				onMessage(decodeUserMessage(result.data))
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
