/**
 * CLOB REST API wire schemas.
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Order Book Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for order book entry (wire format uses numbers directly).
 */
export const orderbookEntryWireSchema = z.object({
	price: z.union([z.string(), z.number()]),
	size: z.union([z.string(), z.number()]),
})

export type OrderbookEntryWire = z.infer<typeof orderbookEntryWireSchema>

/**
 * Schema for order book response.
 */
export const orderbookWireSchema = z.object({
	bids: z.array(orderbookEntryWireSchema),
	asks: z.array(orderbookEntryWireSchema),
})

export type OrderbookWire = z.infer<typeof orderbookWireSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Price Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for midpoint response.
 */
export const midpointWireSchema = z.object({
	mid: z.string(),
})

export type MidpointWire = z.infer<typeof midpointWireSchema>

/**
 * Schema for price response.
 */
export const priceWireSchema = z.object({
	price: z.string(),
})

export type PriceWire = z.infer<typeof priceWireSchema>

/**
 * Schema for spread response.
 */
export const spreadWireSchema = z.object({
	spread: z.string(),
})

export type SpreadWire = z.infer<typeof spreadWireSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Open Order Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for open order (from SDK).
 */
export const openOrderWireSchema = z.object({
	id: z.string(),
	asset_id: z.string(),
	side: z.enum(['BUY', 'SELL']),
	price: z.string(),
	original_size: z.string(),
	size_matched: z.string(),
})

export type OpenOrderWire = z.infer<typeof openOrderWireSchema>

/**
 * Schema for array of open orders.
 */
export const openOrdersWireSchema = z.array(openOrderWireSchema)

export type OpenOrdersWire = z.infer<typeof openOrdersWireSchema>
