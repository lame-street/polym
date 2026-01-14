/**
 * User WebSocket wire schemas.
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Order Schemas (for order_placed messages)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for order in user message.
 */
export const userOrderWireSchema = z.object({
	id: z.string(),
	asset_id: z.string(),
	side: z.enum(['BUY', 'SELL']),
	price: z.union([z.string(), z.number()]),
	original_size: z.union([z.string(), z.number()]),
	size_matched: z.union([z.string(), z.number()]),
})

export type UserOrderWire = z.infer<typeof userOrderWireSchema>

// ─────────────────────────────────────────────────────────────────────────────
// User Message Schemas (Discriminated Union)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for order_placed message.
 */
export const orderPlacedWireSchema = z.object({
	type: z.literal('order_placed'),
	order: userOrderWireSchema,
})

export type OrderPlacedWire = z.infer<typeof orderPlacedWireSchema>

/**
 * Schema for order_matched message.
 */
export const orderMatchedWireSchema = z.object({
	type: z.literal('order_matched'),
	orderId: z.string(),
	sizeMatched: z.union([z.string(), z.number()]),
})

export type OrderMatchedWire = z.infer<typeof orderMatchedWireSchema>

/**
 * Schema for order_cancelled message.
 */
export const orderCancelledWireSchema = z.object({
	type: z.literal('order_cancelled'),
	orderId: z.string(),
})

export type OrderCancelledWire = z.infer<typeof orderCancelledWireSchema>

/**
 * Schema for trade message.
 */
export const tradeWireSchema = z.object({
	type: z.literal('trade'),
	tokenId: z.string(),
	side: z.enum(['BUY', 'SELL']),
	price: z.union([z.string(), z.number()]),
	size: z.union([z.string(), z.number()]),
})

export type TradeWire = z.infer<typeof tradeWireSchema>

/**
 * Schema for user message (discriminated union).
 */
export const userMessageWireSchema = z.discriminatedUnion('type', [
	orderPlacedWireSchema,
	orderMatchedWireSchema,
	orderCancelledWireSchema,
	tradeWireSchema,
])

export type UserMessageWire = z.infer<typeof userMessageWireSchema>
