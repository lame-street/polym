import type { BotConfig, MarketConfig } from '@polym/config'
import type { ConditionId, Order, OrderBook, PolymarketClient, Position, TokenId } from '@polym/sdk'

/**
 * Per-market state.
 */
export interface MarketState {
	/** Market configuration */
	config: MarketConfig
	/** Current order book for token1 */
	orderBook1: OrderBook | null
	/** Current order book for token2 */
	orderBook2: OrderBook | null
	/** Our position in token1 */
	position1: Position | null
	/** Our position in token2 */
	position2: Position | null
	/** Our open orders for token1 */
	orders1: Order[]
	/** Our open orders for token2 */
	orders2: Order[]
	/** Timestamp of last trade action */
	lastTradeTime: number | null
	/** Risk-off until this timestamp (if set) */
	riskOffUntil: number | null
}

/**
 * Trade currently being executed (to prevent duplicates).
 */
export interface PendingTrade {
	tokenId: TokenId
	side: 'BUY' | 'SELL'
	timestamp: number
}

/**
 * Global engine state.
 */
export interface EngineState {
	/** Per-market state keyed by conditionId */
	markets: Map<ConditionId, MarketState>
	/** Trades currently being executed */
	pendingTrades: Map<TokenId, PendingTrade>
	/** All token IDs we're subscribed to */
	subscribedTokens: TokenId[]
	/** Whether the engine is running */
	isRunning: boolean
}

/**
 * Options for running the bot.
 */
export interface RunBotOptions {
	/** Bot configuration */
	config: BotConfig
	/** Polymarket client instance */
	client: PolymarketClient
	/** Optional: dry run mode (no real orders) */
	dryRun?: boolean
}
