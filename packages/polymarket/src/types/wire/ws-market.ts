/**
 * Market WebSocket wire schemas.
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Book Update Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for book update entry.
 */
export const bookUpdateEntryWireSchema = z.object({
	price: z.string(),
	size: z.string(),
})

export type BookUpdateEntryWire = z.infer<typeof bookUpdateEntryWireSchema>

/**
 * Schema for market book update.
 */
export const marketBookUpdateWireSchema = z.object({
	market: z.string(),
	asset_id: z.string(),
	hash: z.string(),
	timestamp: z.string(),
	bids: z.array(bookUpdateEntryWireSchema),
	asks: z.array(bookUpdateEntryWireSchema),
})

export type MarketBookUpdateWire = z.infer<typeof marketBookUpdateWireSchema>

/**
 * Schema for market message (array of book updates).
 */
export const marketMessageWireSchema = z.array(marketBookUpdateWireSchema)

export type MarketMessageWire = z.infer<typeof marketMessageWireSchema>
