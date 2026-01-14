/**
 * Configuration for a single market to trade.
 */
export interface MarketConfig {
	/** Polymarket condition_id */
	conditionId: string
	/** Human-readable question/description */
	question: string
	/** Token ID for outcome 1 (YES) */
	token1: string
	/** Token ID for outcome 2 (NO) */
	token2: string
	/** Answer label for outcome 1 */
	answer1: string
	/** Answer label for outcome 2 */
	answer2: string
	/** Minimum tick size for this market */
	tickSize: number
	/** Whether this is a negative risk market */
	negRisk: boolean
	/** Maximum spread to place orders within (percentage) */
	maxSpread: number
	/** Minimum order size */
	minSize: number
	/** Default trade size */
	tradeSize: number
	/** Maximum position size per outcome */
	maxSize: number
}

/**
 * Strategy parameters for trading.
 */
export interface StrategyParams {
	/** Stop loss threshold (percentage) */
	stopLossThreshold: number
	/** Take profit threshold (percentage) */
	takeProfitThreshold: number
	/** Max spread to consider for stop-loss execution */
	spreadThreshold: number
	/** Max volatility threshold before pausing buys */
	volatilityThreshold: number
	/** Hours to sleep after a stop-loss triggers */
	sleepPeriod: number
}

/**
 * Root bot configuration.
 */
export interface BotConfig {
	/** Markets to trade */
	markets: MarketConfig[]
	/** Default strategy parameters */
	strategy: StrategyParams
	/** Optional: different strategy params per market type */
	strategyOverrides?: Record<string, Partial<StrategyParams>>
}
