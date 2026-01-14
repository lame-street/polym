import { PENDING_TRADE_TIMEOUT_MS } from '../constants'

import type { MarketConfig } from '@polym/config'
import type { ConditionId, TokenId } from '@polym/sdk'
import type { EngineState, MarketState } from '../types'

/**
 * Create initial engine state from market configs.
 *
 * @param markets - Array of market configurations
 * @returns Initialized engine state
 */
export function createEngineState(markets: MarketConfig[]): EngineState {
	const state: EngineState = {
		markets: new Map(),
		pendingTrades: new Map(),
		subscribedTokens: [],
		isRunning: false,
	}

	for (const config of markets) {
		state.markets.set(config.conditionId as ConditionId, {
			config,
			orderBook1: null,
			orderBook2: null,
			position1: null,
			position2: null,
			orders1: [],
			orders2: [],
			lastTradeTime: null,
			riskOffUntil: null,
		})

		state.subscribedTokens.push(config.token1 as TokenId, config.token2 as TokenId)
	}

	return state
}

/**
 * Get market state by condition ID.
 *
 * @param state - Engine state
 * @param conditionId - Market condition ID
 * @returns Market state if found
 */
export function getMarketState(
	state: EngineState,
	conditionId: ConditionId,
): MarketState | undefined {
	return state.markets.get(conditionId)
}

/**
 * Find market state by token ID.
 *
 * @param state - Engine state
 * @param tokenId - Token ID to search for (accepts branded or plain string)
 * @returns Market state if found
 */
export function findMarketByToken(
	state: EngineState,
	tokenId: TokenId | string,
): MarketState | undefined {
	for (const market of state.markets.values()) {
		if (market.config.token1 === tokenId || market.config.token2 === tokenId) {
			return market
		}
	}
	return undefined
}

/**
 * Check if a market is in risk-off period.
 *
 * @param market - Market state to check
 * @returns True if in risk-off period
 */
export function isRiskOff(market: MarketState): boolean {
	if (!market.riskOffUntil) return false
	return Date.now() < market.riskOffUntil
}

/**
 * Add a pending trade to prevent duplicates.
 *
 * @param state - Engine state
 * @param tokenId - Token ID
 * @param side - Trade side
 */
export function addPendingTrade(
	state: EngineState,
	tokenId: TokenId | string,
	side: 'BUY' | 'SELL',
): void {
	state.pendingTrades.set(tokenId as TokenId, {
		tokenId: tokenId as TokenId,
		side,
		timestamp: Date.now(),
	})
}

/**
 * Remove a pending trade.
 *
 * @param state - Engine state
 * @param tokenId - Token ID to remove
 */
export function removePendingTrade(state: EngineState, tokenId: TokenId | string): void {
	state.pendingTrades.delete(tokenId as TokenId)
}

/**
 * Clean up stale pending trades.
 *
 * @param state - Engine state
 */
export function cleanStalePendingTrades(state: EngineState): void {
	const now = Date.now()

	for (const [tokenId, trade] of state.pendingTrades) {
		if (now - trade.timestamp > PENDING_TRADE_TIMEOUT_MS) {
			state.pendingTrades.delete(tokenId)
		}
	}
}
