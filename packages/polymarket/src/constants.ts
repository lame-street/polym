/**
 * Polymarket API endpoints and WebSocket URLs.
 *
 * @see https://docs.polymarket.com/quickstart/reference/endpoints
 */

// ─────────────────────────────────────────────────────────────────────────────
// REST API Hosts
// ─────────────────────────────────────────────────────────────────────────────

/** CLOB API - Order management, prices, orderbooks */
export const CLOB_API_HOST = 'https://clob.polymarket.com'

/** Gamma API - Market discovery, metadata, events */
export const GAMMA_API_HOST = 'https://gamma-api.polymarket.com'

/** Data API - User positions, activity, history */
export const DATA_API_HOST = 'https://data-api.polymarket.com'

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket URLs
// ─────────────────────────────────────────────────────────────────────────────

/** WebSocket URLs for real-time data */
export const WS_URLS = {
	/** Public orderbook and price updates */
	market: 'wss://ws-subscriptions-clob.polymarket.com/ws/market',
	/** Authenticated order/trade updates */
	user: 'wss://ws-subscriptions-clob.polymarket.com/ws/user',
	/** Real-Time Data Socket (crypto prices, comments) */
	rtds: 'wss://ws-live-data.polymarket.com',
} as const
