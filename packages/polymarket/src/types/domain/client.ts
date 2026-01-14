/**
 * Client configuration and API interface types.
 */

import type { ConditionId, TokenId, WalletAddress } from '../ids'
import type { GammaEvent, GammaMarket } from './markets'
import type { OrderBook } from './orderbook'
import type { Order, OrderResult, Side } from './orders'
import type { Position } from './positions'

/**
 * API credentials for authenticated endpoints.
 */
export interface ApiCredentials {
	apiKey: string
	apiSecret: string
	apiPassphrase: string
}

/**
 * Options for creating a PolymarketClient.
 */
export interface PolymarketClientOptions {
	/** Private key for signing */
	privateKey: string
	/** Browser wallet address (funder) */
	walletAddress: string
	/** Optional: custom API host */
	host?: string
}

/**
 * Public CLOB API interface (order books, prices).
 */
export interface ClobPublicApi {
	getOrderBook(tokenId: TokenId): Promise<OrderBook>
	getMidpoint(tokenId: TokenId): Promise<number>
	getPrice(tokenId: TokenId, side: Side): Promise<number>
	getSpread(tokenId: TokenId): Promise<number>
}

/**
 * Gamma API interface (events, markets, metadata).
 */
export interface GammaApi {
	getEvents(options?: {
		limit?: number
		offset?: number
		active?: boolean
		closed?: boolean
	}): Promise<GammaEvent[]>
	getEvent(eventId: string): Promise<GammaEvent>
	getMarkets(options?: {
		limit?: number
		offset?: number
		active?: boolean
		closed?: boolean
	}): Promise<GammaMarket[]>
	getMarket(marketId: string): Promise<GammaMarket>
}

/**
 * Data API interface (positions, activity).
 */
export interface DataApi {
	getPositions(walletAddress: WalletAddress): Promise<Position[]>
	getPositionValue(walletAddress: WalletAddress): Promise<number>
}

/**
 * Authenticated CLOB API interface (orders, trading).
 *
 * Wraps `@polymarket/clob-client` SDK for all authenticated operations.
 */
export interface ClobAuthenticatedApi {
	deriveCredentials(): Promise<ApiCredentials>
	setCredentials(creds: ApiCredentials): void
	getCredentials(): ApiCredentials
	getWalletAddress(): WalletAddress
	createOrder(
		tokenId: TokenId,
		side: Side,
		price: number,
		size: number,
		options?: { negRisk?: boolean },
	): Promise<OrderResult>
	cancelAllForMarket(conditionId: ConditionId): Promise<void>
	cancelAll(): Promise<void>
	getOrders(): Promise<Order[]>
	getMarketOrders(conditionId: ConditionId): Promise<Order[]>
	getUsdcBalance(): Promise<number>
}
