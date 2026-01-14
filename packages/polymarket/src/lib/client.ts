import { ClobPolymarketClient, ClobPublicClient, DataClient, GammaClient } from './rest'

import type { ApiCredentials, PolymarketClientOptions } from '../types/domain/client'
import type { GammaEvent, GammaMarket } from '../types/domain/markets'
import type { OrderBook } from '../types/domain/orderbook'
import type { Order, OrderResult, Side } from '../types/domain/orders'
import type { Position } from '../types/domain/positions'
import type { ConditionId, TokenId } from '../types/ids'

/**
 * Facade client providing unified access to all Polymarket APIs.
 *
 * Structure:
 * - `client.clobPublic` - Public CLOB endpoints (order books, prices)
 * - `client.gamma` - Gamma API (events, markets, metadata)
 * - `client.data` - Data API (positions, activity)
 * - `client.clob` - Authenticated CLOB (orders, trading)
 *
 * Shorthand methods delegate to the appropriate sub-client.
 */
export class PolymarketClient {
	/** Public CLOB API (order books, prices, spreads) */
	public readonly clobPublic: ClobPublicClient

	/** Gamma API (events, markets, metadata) */
	public readonly gamma: GammaClient

	/** Data API (positions, activity, history) */
	public readonly data: DataClient

	/** Authenticated CLOB client (orders, trading) */
	public readonly clob: ClobPolymarketClient

	constructor(options: PolymarketClientOptions) {
		this.clobPublic = new ClobPublicClient({ host: options.host })
		this.gamma = new GammaClient()
		this.data = new DataClient()
		this.clob = new ClobPolymarketClient(options)
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Authentication (delegates to clob)
	// ─────────────────────────────────────────────────────────────────────────────

	/**
	 * Derive API credentials from private key.
	 *
	 * @returns The derived API credentials
	 */
	deriveCredentials(): Promise<ApiCredentials> {
		return this.clob.deriveCredentials()
	}

	/**
	 * Set API credentials (if already derived externally).
	 *
	 * @param creds - API credentials to set
	 */
	setCredentials(creds: ApiCredentials): void {
		this.clob.setCredentials(creds)
	}

	/**
	 * Get stored credentials.
	 *
	 * @returns The stored API credentials
	 */
	getCredentials(): ApiCredentials {
		return this.clob.getCredentials()
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Public CLOB API (delegates to clobPublic)
	// ─────────────────────────────────────────────────────────────────────────────

	/**
	 * Get order book for a token.
	 *
	 * @param tokenId - Token ID
	 * @returns The order book
	 */
	getOrderBook(tokenId: TokenId): Promise<OrderBook> {
		return this.clobPublic.getOrderBook(tokenId)
	}

	/**
	 * Get midpoint price for a token.
	 *
	 * @param tokenId - Token ID
	 * @returns The midpoint price
	 */
	getMidpoint(tokenId: TokenId): Promise<number> {
		return this.clobPublic.getMidpoint(tokenId)
	}

	/**
	 * Get price for a token on a specific side.
	 *
	 * @param tokenId - Token ID
	 * @param side - 'BUY' or 'SELL'
	 * @returns The price
	 */
	getPrice(tokenId: TokenId, side: Side): Promise<number> {
		return this.clobPublic.getPrice(tokenId, side)
	}

	/**
	 * Get spread for a token.
	 *
	 * @param tokenId - Token ID
	 * @returns The spread
	 */
	getSpread(tokenId: TokenId): Promise<number> {
		return this.clobPublic.getSpread(tokenId)
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Gamma API (delegates to gamma)
	// ─────────────────────────────────────────────────────────────────────────────

	/**
	 * Get a list of events.
	 *
	 * @param options - Query options
	 * @returns An array of events
	 */
	getEvents(options?: {
		limit?: number
		offset?: number
		active?: boolean
		closed?: boolean
	}): Promise<GammaEvent[]> {
		return this.gamma.getEvents(options)
	}

	/**
	 * Get a specific event by ID.
	 *
	 * @param eventId - Event ID
	 * @returns The event details
	 */
	getEvent(eventId: string): Promise<GammaEvent> {
		return this.gamma.getEvent(eventId)
	}

	/**
	 * Get a list of markets.
	 *
	 * @param options - Query options
	 * @returns An array of markets
	 */
	getMarkets(options?: {
		limit?: number
		offset?: number
		active?: boolean
		closed?: boolean
	}): Promise<GammaMarket[]> {
		return this.gamma.getMarkets(options)
	}

	/**
	 * Get a specific market by ID.
	 *
	 * @param marketId - Market ID (numeric)
	 * @returns The market details
	 */
	getMarket(marketId: string): Promise<GammaMarket> {
		return this.gamma.getMarket(marketId)
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Data API (delegates to data)
	// ─────────────────────────────────────────────────────────────────────────────

	/**
	 * Get all positions for the wallet.
	 *
	 * @returns An array of positions
	 */
	getAllPositions(): Promise<Position[]> {
		return this.data.getPositions(this.clob.getWalletAddress())
	}

	/**
	 * Get total position value.
	 *
	 * @returns The total position value
	 */
	getPositionValue(): Promise<number> {
		return this.data.getPositionValue(this.clob.getWalletAddress())
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Authenticated CLOB (delegates to clob)
	// ─────────────────────────────────────────────────────────────────────────────

	/**
	 * Create and submit an order.
	 *
	 * @param tokenId - Market token ID
	 * @param side - Order side (BUY or SELL)
	 * @param price - Order price (0-1 range)
	 * @param size - Order size in shares
	 * @param options - Optional order options
	 * @returns The result of the order placement
	 */
	createOrder(
		tokenId: TokenId,
		side: Side,
		price: number,
		size: number,
		options?: { negRisk?: boolean },
	): Promise<OrderResult> {
		return this.clob.createOrder(tokenId, side, price, size, options)
	}

	/**
	 * Cancel all orders for a market.
	 *
	 * @param conditionId - Market condition ID
	 * @returns A promise that resolves when cancelled
	 */
	cancelAllForMarket(conditionId: ConditionId): Promise<void> {
		return this.clob.cancelAllForMarket(conditionId)
	}

	/**
	 * Cancel all open orders.
	 *
	 * @returns A promise that resolves when cancelled
	 */
	cancelAll(): Promise<void> {
		return this.clob.cancelAll()
	}

	/**
	 * Get all open orders.
	 *
	 * @returns An array of open orders
	 */
	getOrders(): Promise<Order[]> {
		return this.clob.getOrders()
	}

	/**
	 * Get open orders for a specific market.
	 *
	 * @param conditionId - Market condition ID
	 * @returns An array of open orders
	 */
	getMarketOrders(conditionId: ConditionId): Promise<Order[]> {
		return this.clob.getMarketOrders(conditionId)
	}

	/**
	 * Get USDC balance.
	 *
	 * @returns The USDC balance
	 */
	getUsdcBalance(): Promise<number> {
		return this.clob.getUsdcBalance()
	}
}
