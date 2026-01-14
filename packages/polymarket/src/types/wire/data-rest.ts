/**
 * Data API wire schemas.
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Position Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for position entry.
 */
export const positionWireSchema = z.object({
	asset: z.string(),
	size: z.string(),
	avgPrice: z.string(),
})

export type PositionWire = z.infer<typeof positionWireSchema>

/**
 * Schema for positions array.
 */
export const positionsWireSchema = z.array(positionWireSchema)

export type PositionsWire = z.infer<typeof positionsWireSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Value Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for value entry.
 */
export const valueEntryWireSchema = z.object({
	user: z.string(),
	value: z.number(),
})

export type ValueEntryWire = z.infer<typeof valueEntryWireSchema>

/**
 * Schema for value response (array of entries).
 */
export const valueWireSchema = z.array(valueEntryWireSchema)

export type ValueWire = z.infer<typeof valueWireSchema>
