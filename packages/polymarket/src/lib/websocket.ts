import { connectClobUserWebSocket, connectPublicMarketWebSocket } from './ws'

import type {
	MarketWebSocketOptions,
	UserWebSocketOptions,
	WebSocketHandle,
} from '../types/domain/websocket'

/**
 * Backwards-compat websocket export.
 *
 * - Market websocket is public
 * - User websocket is authenticated
 *
 * @param options - Market websocket options
 * @returns WebSocket handle
 */
export function connectMarketWebSocket(options: MarketWebSocketOptions): WebSocketHandle {
	return connectPublicMarketWebSocket(options)
}

/**
 * Backwards-compat websocket export.
 *
 * - Market websocket is public
 * - User websocket is authenticated
 *
 * @param options - User websocket options
 * @returns WebSocket handle
 */
export function connectUserWebSocket(options: UserWebSocketOptions): WebSocketHandle {
	return connectClobUserWebSocket(options)
}
