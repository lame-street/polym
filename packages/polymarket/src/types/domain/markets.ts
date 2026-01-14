/**
 * Market and event domain types.
 */

import type { ConditionId, EventId, MarketId, TokenId } from '../ids'

/**
 * Fields available for sorting markets in the Gamma API.
 */
export type GammaMarketSortField =
	| 'volume'
	| 'volume24hr'
	| 'volume1wk'
	| 'volume1mo'
	| 'liquidity'
	| 'endDate'
	| 'startDate'
	| 'createdAt'

/**
 * Event from the Gamma API.
 */
export interface GammaEvent {
	id: EventId
	title: string
	slug: string
	description: string
	startDate?: string
	endDate: string
	active: boolean
	closed: boolean
	markets?: GammaMarket[]
}

/**
 * Market from the Gamma API (parsed/normalized).
 */
export interface GammaMarket {
	id: MarketId
	conditionId: ConditionId
	question: string
	description: string
	outcomes: string[]
	outcomePrices: number[]
	volume: number
	liquidity: number
	endDate: string
	active: boolean
	closed: boolean
	tokenIds: TokenId[]
}
