/**
 * Gamma API codecs - wire to domain conversion.
 */

import { ConditionId, EventId, MarketId, TokenId } from '../ids'

import type { GammaEvent, GammaMarket } from '../domain/markets'
import type { GammaEventWire, GammaMarketWire } from '../wire/gamma'

/**
 * Decode a Gamma market wire response to domain type.
 *
 * @param wire - Raw market from API
 * @returns Parsed market with proper types
 */
export function decodeGammaMarket(wire: GammaMarketWire): GammaMarket {
	const outcomes = wire.outcomes ? (JSON.parse(wire.outcomes) as string[]) : []
	const outcomePrices = wire.outcomePrices
		? (JSON.parse(wire.outcomePrices) as string[]).map(Number)
		: []
	const tokenIds = wire.clobTokenIds
		? (JSON.parse(wire.clobTokenIds) as string[]).map(TokenId)
		: []

	return {
		id: MarketId(wire.id),
		conditionId: ConditionId(wire.conditionId),
		question: wire.question,
		description: wire.description,
		outcomes,
		outcomePrices,
		volume: Number(wire.volume),
		liquidity: Number(wire.liquidity),
		endDate: wire.endDate,
		active: wire.active,
		closed: wire.closed,
		tokenIds,
	}
}

/**
 * Decode an array of Gamma market wire responses to domain types.
 *
 * @param wires - Array of raw markets from API
 * @returns Array of parsed markets
 */
export function decodeGammaMarkets(wires: GammaMarketWire[]): GammaMarket[] {
	return wires.map(decodeGammaMarket)
}

/**
 * Decode a Gamma event wire response to domain type.
 *
 * @param wire - Raw event from API
 * @returns Parsed event with proper types
 */
export function decodeGammaEvent(wire: GammaEventWire): GammaEvent {
	return {
		id: EventId(wire.id),
		title: wire.title,
		slug: wire.slug,
		description: wire.description,
		startDate: wire.startDate,
		endDate: wire.endDate,
		active: wire.active,
		closed: wire.closed,
		markets: wire.markets?.map(decodeGammaMarket),
	}
}

/**
 * Decode an array of Gamma event wire responses to domain types.
 *
 * @param wires - Array of raw events from API
 * @returns Array of parsed events
 */
export function decodeGammaEvents(wires: GammaEventWire[]): GammaEvent[] {
	return wires.map(decodeGammaEvent)
}
