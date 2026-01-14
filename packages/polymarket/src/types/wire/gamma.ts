/**
 * Gamma API wire schemas.
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Market Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for raw Gamma market response.
 * Note: outcomes, outcomePrices, clobTokenIds are JSON strings that need parsing.
 */
export const gammaMarketWireSchema = z.object({
	id: z.string(),
	conditionId: z.string(),
	question: z.string(),
	description: z.string(),
	outcomes: z.string(), // JSON array string
	outcomePrices: z.string(), // JSON array string
	volume: z.string(), // Numeric string
	liquidity: z.string(), // Numeric string
	endDate: z.string(),
	active: z.boolean(),
	closed: z.boolean(),
	clobTokenIds: z.string().optional(), // JSON array string
})

export type GammaMarketWire = z.infer<typeof gammaMarketWireSchema>

/**
 * Schema for array of raw Gamma markets.
 */
export const gammaMarketsWireSchema = z.array(gammaMarketWireSchema)

export type GammaMarketsWire = z.infer<typeof gammaMarketsWireSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Event Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for Gamma event response.
 */
export const gammaEventWireSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	startDate: z.string().optional(),
	endDate: z.string(),
	active: z.boolean(),
	closed: z.boolean(),
	markets: z.array(gammaMarketWireSchema).optional(),
})

export type GammaEventWire = z.infer<typeof gammaEventWireSchema>

/**
 * Schema for array of Gamma events.
 */
export const gammaEventsWireSchema = z.array(gammaEventWireSchema)

export type GammaEventsWire = z.infer<typeof gammaEventsWireSchema>
