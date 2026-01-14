/**
 * RTDS (Real-Time Data Socket) wire schemas.
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Payload Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for trade payload.
 */
export const rtdsTradePayloadWireSchema = z.object({
	asset: z.string(),
	bio: z.string(),
	conditionId: z.string(),
	eventSlug: z.string(),
	icon: z.string(),
	name: z.string(),
	outcome: z.string(),
	outcomeIndex: z.number(),
	price: z.number(),
	profileImage: z.string(),
	proxyWallet: z.string(),
	pseudonym: z.string(),
	side: z.enum(['BUY', 'SELL']),
	size: z.number(),
	slug: z.string(),
	timestamp: z.number(),
	title: z.string(),
	transactionHash: z.string(),
})

export type RtdsTradePayloadWire = z.infer<typeof rtdsTradePayloadWireSchema>

/**
 * Schema for crypto price payload.
 */
export const rtdsCryptoPricePayloadWireSchema = z.object({
	symbol: z.string(),
	timestamp: z.number(),
	value: z.number(),
})

export type RtdsCryptoPricePayloadWire = z.infer<typeof rtdsCryptoPricePayloadWireSchema>

/**
 * Schema for equity price payload.
 */
export const rtdsEquityPricePayloadWireSchema = z.object({
	symbol: z.string(),
	timestamp: z.number(),
	value: z.number(),
})

export type RtdsEquityPricePayloadWire = z.infer<typeof rtdsEquityPricePayloadWireSchema>

/**
 * Schema for comment payload.
 */
export const rtdsCommentPayloadWireSchema = z.object({
	id: z.string(),
	body: z.string(),
	parentEntityType: z.enum(['Event', 'Series']),
	parentEntityID: z.number(),
	parentCommentID: z.string().nullable(),
	userAddress: z.string(),
	replyAddress: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export type RtdsCommentPayloadWire = z.infer<typeof rtdsCommentPayloadWireSchema>

/**
 * Schema for reaction payload.
 */
export const rtdsReactionPayloadWireSchema = z.object({
	id: z.string(),
	commentID: z.number(),
	reactionType: z.string(),
	icon: z.string(),
	userAddress: z.string(),
	createdAt: z.string(),
})

export type RtdsReactionPayloadWire = z.infer<typeof rtdsReactionPayloadWireSchema>

/**
 * Schema for CLOB price change entry.
 */
export const clobPriceChangeEntryWireSchema = z.object({
	a: z.string(), // asset_id
	ba: z.string(), // best ask
	bb: z.string(), // best bid
	p: z.string(), // price
	s: z.string(), // size
	si: z.enum(['BUY', 'SELL']), // side
	h: z.string(), // hash
})

export type ClobPriceChangeEntryWire = z.infer<typeof clobPriceChangeEntryWireSchema>

/**
 * Schema for CLOB price change payload.
 */
export const clobPriceChangePayloadWireSchema = z.object({
	m: z.string(), // market/condition ID
	pc: z.array(clobPriceChangeEntryWireSchema),
	t: z.string(), // timestamp
})

export type ClobPriceChangePayloadWire = z.infer<typeof clobPriceChangePayloadWireSchema>

/**
 * Schema for CLOB aggregate orderbook payload.
 */
export const clobAggOrderbookPayloadWireSchema = z.object({
	m: z.string(), // market/condition ID
	a: z.string(), // asset ID
	b: z.array(z.object({ p: z.string(), s: z.string() })), // bids
	ak: z.array(z.object({ p: z.string(), s: z.string() })), // asks
	t: z.string(), // timestamp
	h: z.string(), // hash
})

export type ClobAggOrderbookPayloadWire = z.infer<typeof clobAggOrderbookPayloadWireSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Base RTDS Message Schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for base RTDS message structure.
 * Used for initial parsing before discriminating on topic/type.
 */
export const rtdsMessageBaseWireSchema = z.object({
	topic: z.string(),
	type: z.string(),
	timestamp: z.number(),
	payload: z.unknown(),
})

export type RtdsMessageBaseWire = z.infer<typeof rtdsMessageBaseWireSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Typed RTDS Message Schemas (Discriminated by topic + type)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for activity:trades message.
 */
export const rtdsTradeMessageWireSchema = z.object({
	topic: z.literal('activity'),
	type: z.literal('trades'),
	timestamp: z.number(),
	payload: rtdsTradePayloadWireSchema,
})

export type RtdsTradeMessageWire = z.infer<typeof rtdsTradeMessageWireSchema>

/**
 * Schema for activity:orders_matched message.
 */
export const rtdsOrdersMatchedMessageWireSchema = z.object({
	topic: z.literal('activity'),
	type: z.literal('orders_matched'),
	timestamp: z.number(),
	payload: z.unknown(),
})

export type RtdsOrdersMatchedMessageWire = z.infer<typeof rtdsOrdersMatchedMessageWireSchema>

/**
 * Schema for crypto_prices:update message.
 */
export const rtdsCryptoPriceMessageWireSchema = z.object({
	topic: z.literal('crypto_prices'),
	type: z.literal('update'),
	timestamp: z.number(),
	payload: rtdsCryptoPricePayloadWireSchema,
})

export type RtdsCryptoPriceMessageWire = z.infer<typeof rtdsCryptoPriceMessageWireSchema>

/**
 * Schema for crypto_prices_chainlink:update message.
 */
export const rtdsChainlinkPriceMessageWireSchema = z.object({
	topic: z.literal('crypto_prices_chainlink'),
	type: z.literal('update'),
	timestamp: z.number(),
	payload: rtdsCryptoPricePayloadWireSchema,
})

export type RtdsChainlinkPriceMessageWire = z.infer<typeof rtdsChainlinkPriceMessageWireSchema>

/**
 * Schema for equity_prices:update message.
 */
export const rtdsEquityPriceMessageWireSchema = z.object({
	topic: z.literal('equity_prices'),
	type: z.literal('update'),
	timestamp: z.number(),
	payload: rtdsEquityPricePayloadWireSchema,
})

export type RtdsEquityPriceMessageWire = z.infer<typeof rtdsEquityPriceMessageWireSchema>

/**
 * Schema for comments:comment_created message.
 */
export const rtdsCommentCreatedMessageWireSchema = z.object({
	topic: z.literal('comments'),
	type: z.literal('comment_created'),
	timestamp: z.number(),
	payload: rtdsCommentPayloadWireSchema,
})

export type RtdsCommentCreatedMessageWire = z.infer<typeof rtdsCommentCreatedMessageWireSchema>

/**
 * Schema for comments:comment_removed message.
 */
export const rtdsCommentRemovedMessageWireSchema = z.object({
	topic: z.literal('comments'),
	type: z.literal('comment_removed'),
	timestamp: z.number(),
	payload: rtdsCommentPayloadWireSchema,
})

export type RtdsCommentRemovedMessageWire = z.infer<typeof rtdsCommentRemovedMessageWireSchema>

/**
 * Schema for comments:reaction_created message.
 */
export const rtdsReactionCreatedMessageWireSchema = z.object({
	topic: z.literal('comments'),
	type: z.literal('reaction_created'),
	timestamp: z.number(),
	payload: rtdsReactionPayloadWireSchema,
})

export type RtdsReactionCreatedMessageWire = z.infer<typeof rtdsReactionCreatedMessageWireSchema>

/**
 * Schema for comments:reaction_removed message.
 */
export const rtdsReactionRemovedMessageWireSchema = z.object({
	topic: z.literal('comments'),
	type: z.literal('reaction_removed'),
	timestamp: z.number(),
	payload: rtdsReactionPayloadWireSchema,
})

export type RtdsReactionRemovedMessageWire = z.infer<typeof rtdsReactionRemovedMessageWireSchema>

/**
 * Schema for clob_market:price_change message.
 */
export const rtdsClobPriceChangeMessageWireSchema = z.object({
	topic: z.literal('clob_market'),
	type: z.literal('price_change'),
	timestamp: z.number(),
	payload: clobPriceChangePayloadWireSchema,
})

export type RtdsClobPriceChangeMessageWire = z.infer<typeof rtdsClobPriceChangeMessageWireSchema>

/**
 * Schema for clob_market:agg_orderbook message.
 */
export const rtdsClobAggOrderbookMessageWireSchema = z.object({
	topic: z.literal('clob_market'),
	type: z.literal('agg_orderbook'),
	timestamp: z.number(),
	payload: clobAggOrderbookPayloadWireSchema,
})

export type RtdsClobAggOrderbookMessageWire = z.infer<typeof rtdsClobAggOrderbookMessageWireSchema>
