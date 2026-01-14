/**
 * WebSocket domain types.
 */

import type { ConditionId, OrderId, TokenId } from '../ids'
import type { ApiCredentials } from './client'
import type { Order, Side } from './orders'

// ─────────────────────────────────────────────────────────────────────────────
// Market WebSocket Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Market websocket book update.
 */
export interface MarketBookUpdate {
	market: ConditionId
	asset_id: TokenId
	hash: string
	timestamp: string
	bids: Array<{ price: string; size: string }>
	asks: Array<{ price: string; size: string }>
}

/**
 * Market websocket message (array of book updates).
 */
export type MarketMessage = MarketBookUpdate[]

/**
 * Handler for market websocket messages.
 */
export type MarketMessageHandler = (message: MarketMessage) => void

/**
 * Options for market websocket connection.
 */
export interface MarketWebSocketOptions {
	/** Token IDs to subscribe to */
	tokenIds: TokenId[]
	/** Message handler */
	onMessage: MarketMessageHandler
	/** Error handler */
	onError?: (error: Error) => void
	/** Close handler */
	onClose?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// User WebSocket Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * User websocket message types.
 */
export type UserMessage =
	| { type: 'order_placed'; order: Order }
	| { type: 'order_matched'; orderId: OrderId; sizeMatched: number }
	| { type: 'order_cancelled'; orderId: OrderId }
	| { type: 'trade'; tokenId: TokenId; side: Side; price: number; size: number }

/**
 * Handler for user websocket messages.
 */
export type UserMessageHandler = (message: UserMessage) => void

/**
 * Options for user websocket connection.
 */
export interface UserWebSocketOptions {
	/** API credentials for authentication */
	credentials: ApiCredentials
	/** Message handler */
	onMessage: UserMessageHandler
	/** Error handler */
	onError?: (error: Error) => void
	/** Close handler */
	onClose?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared WebSocket Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * WebSocket connection handle.
 */
export interface WebSocketHandle {
	/** Close the connection */
	close(): void
	/** Whether the connection is open */
	isOpen(): boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// RTDS (Real-Time Data Socket) Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * RTDS subscription topic.
 */
export type RtdsTopic =
	| 'crypto_prices'
	| 'crypto_prices_chainlink'
	| 'equity_prices'
	| 'comments'
	| 'activity'
	| 'rfq'
	| 'clob_market'
	| 'clob_user'

/**
 * RTDS subscription request.
 */
export interface RtdsSubscription {
	/** Topic to subscribe to */
	topic: RtdsTopic
	/** Message type filter (e.g., "update", "comment_created", or "*" for all) */
	type?: string
	/** Additional filters (comma-separated symbols or JSON object) */
	filters?: string
	/** CLOB auth (for trading-related subscriptions) */
	clob_auth?: {
		key: string
		secret: string
		passphrase: string
	}
	/** Gamma auth (for user-specific data) */
	gamma_auth?: {
		address: string
	}
}

/**
 * Extended WebSocket handle for RTDS with subscription management.
 */
export interface RtdsWebSocketHandle extends WebSocketHandle {
	/** Subscribe to additional topics */
	subscribe(subscriptions: RtdsSubscription[]): void
	/** Unsubscribe from topics */
	unsubscribe(subscriptions: RtdsSubscription[]): void
}

// ─────────────────────────────────────────────────────────────────────────────
// RTDS Message Types (Discriminated Union)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base RTDS message structure.
 */
interface RtdsMessageBase<TTopic extends RtdsTopic, TType extends string, TPayload> {
	topic: TTopic
	type: TType
	timestamp: number
	payload: TPayload
}

/**
 * RTDS trade activity payload.
 */
export interface RtdsTradePayload {
	/** ERC1155 token ID of conditional token being traded */
	asset: TokenId
	/** Bio of the user */
	bio: string
	/** Market condition ID */
	conditionId: ConditionId
	/** Slug of the event */
	eventSlug: string
	/** URL to the market icon image */
	icon: string
	/** Name of the user */
	name: string
	/** Human readable outcome */
	outcome: string
	/** Index of the outcome */
	outcomeIndex: number
	/** Price of the trade */
	price: number
	/** URL to the user profile image */
	profileImage: string
	/** Address of the user proxy wallet */
	proxyWallet: string
	/** Pseudonym of the user */
	pseudonym: string
	/** Side of the trade (BUY/SELL) */
	side: Side
	/** Size of the trade */
	size: number
	/** Slug of the market */
	slug: string
	/** Timestamp of the trade */
	timestamp: number
	/** Title of the event */
	title: string
	/** Hash of the transaction */
	transactionHash: string
}

/**
 * RTDS crypto price update payload.
 */
export interface RtdsCryptoPricePayload {
	/** Trading pair symbol (e.g., "BTCUSDT" for Binance, "eth/usd" for Chainlink) */
	symbol: string
	/** Price timestamp in Unix milliseconds */
	timestamp: number
	/** Current price value in quote currency */
	value: number
}

/**
 * RTDS equity price update payload.
 */
export interface RtdsEquityPricePayload {
	/** Stock symbol (e.g., "AAPL", "TSLA") */
	symbol: string
	/** Price timestamp in Unix milliseconds */
	timestamp: number
	/** Current price value */
	value: number
}

/**
 * RTDS comment event payload.
 */
export interface RtdsCommentPayload {
	/** Comment ID */
	id: string
	/** Comment body text */
	body: string
	/** Parent entity type */
	parentEntityType: 'Event' | 'Series'
	/** Parent entity ID */
	parentEntityID: number
	/** Parent comment ID (for replies) */
	parentCommentID: string | null
	/** User wallet address */
	userAddress: string
	/** Reply address */
	replyAddress: string
	/** ISO 8601 creation timestamp */
	createdAt: string
	/** ISO 8601 update timestamp */
	updatedAt: string
}

/**
 * RTDS reaction event payload.
 */
export interface RtdsReactionPayload {
	/** Reaction ID */
	id: string
	/** Comment ID */
	commentID: number
	/** Reaction type */
	reactionType: string
	/** Reaction icon */
	icon: string
	/** User wallet address */
	userAddress: string
	/** ISO 8601 creation timestamp */
	createdAt: string
}

/**
 * CLOB market price change entry.
 */
export interface ClobPriceChangeEntry {
	/** Asset/token ID */
	a: TokenId
	/** Best ask */
	ba: string
	/** Best bid */
	bb: string
	/** Price */
	p: string
	/** Size */
	s: string
	/** Side */
	si: Side
	/** Hash */
	h: string
}

/**
 * CLOB market price change payload.
 */
export interface ClobPriceChangePayload {
	/** Market/condition ID */
	m: ConditionId
	/** Price changes */
	pc: ClobPriceChangeEntry[]
	/** Timestamp */
	t: string
}

/**
 * CLOB market aggregate orderbook payload.
 */
export interface ClobAggOrderbookPayload {
	/** Market/condition ID */
	m: ConditionId
	/** Asset ID */
	a: TokenId
	/** Bids */
	b: Array<{ p: string; s: string }>
	/** Asks */
	ak: Array<{ p: string; s: string }>
	/** Timestamp */
	t: string
	/** Hash */
	h: string
}

// Discriminated union of all RTDS message types
export type RtdsTradeMessage = RtdsMessageBase<'activity', 'trades', RtdsTradePayload>
export type RtdsOrdersMatchedMessage = RtdsMessageBase<'activity', 'orders_matched', unknown>
export type RtdsCryptoPriceMessage = RtdsMessageBase<
	'crypto_prices',
	'update',
	RtdsCryptoPricePayload
>
export type RtdsChainlinkPriceMessage = RtdsMessageBase<
	'crypto_prices_chainlink',
	'update',
	RtdsCryptoPricePayload
>
export type RtdsEquityPriceMessage = RtdsMessageBase<
	'equity_prices',
	'update',
	RtdsEquityPricePayload
>
export type RtdsCommentCreatedMessage = RtdsMessageBase<
	'comments',
	'comment_created',
	RtdsCommentPayload
>
export type RtdsCommentRemovedMessage = RtdsMessageBase<
	'comments',
	'comment_removed',
	RtdsCommentPayload
>
export type RtdsReactionCreatedMessage = RtdsMessageBase<
	'comments',
	'reaction_created',
	RtdsReactionPayload
>
export type RtdsReactionRemovedMessage = RtdsMessageBase<
	'comments',
	'reaction_removed',
	RtdsReactionPayload
>
export type RtdsClobPriceChangeMessage = RtdsMessageBase<
	'clob_market',
	'price_change',
	ClobPriceChangePayload
>
export type RtdsClobAggOrderbookMessage = RtdsMessageBase<
	'clob_market',
	'agg_orderbook',
	ClobAggOrderbookPayload
>

/**
 * Union of all typed RTDS messages.
 */
export type RtdsMessage =
	| RtdsTradeMessage
	| RtdsOrdersMatchedMessage
	| RtdsCryptoPriceMessage
	| RtdsChainlinkPriceMessage
	| RtdsEquityPriceMessage
	| RtdsCommentCreatedMessage
	| RtdsCommentRemovedMessage
	| RtdsReactionCreatedMessage
	| RtdsReactionRemovedMessage
	| RtdsClobPriceChangeMessage
	| RtdsClobAggOrderbookMessage

/**
 * RTDS message handler.
 */
export type RtdsMessageHandler = (message: RtdsMessage) => void

/**
 * Options for RTDS websocket connection.
 */
export interface RtdsWebSocketOptions {
	/** Initial subscriptions */
	subscriptions: RtdsSubscription[]
	/** Message handler */
	onMessage: RtdsMessageHandler
	/** Error handler */
	onError?: (error: Error) => void
	/** Close handler */
	onClose?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// RTDS Message Type Registry
// ─────────────────────────────────────────────────────────────────────────────

/**
 * RTDS message types by topic.
 */
export const RTDS_MESSAGE_TYPES = {
	activity: ['trades', 'orders_matched'] as const,
	comments: [
		'comment_created',
		'comment_removed',
		'reaction_created',
		'reaction_removed',
	] as const,
	rfq: [
		'request_created',
		'request_edited',
		'request_canceled',
		'request_expired',
		'quote_created',
		'quote_edited',
		'quote_canceled',
		'quote_expired',
	] as const,
	crypto_prices: ['update'] as const,
	crypto_prices_chainlink: ['update'] as const,
	equity_prices: ['update'] as const,
	clob_market: ['price_change', 'agg_orderbook'] as const,
	clob_user: ['*'] as const,
} as const

/** RTDS activity message types */
export type RtdsActivityType = (typeof RTDS_MESSAGE_TYPES.activity)[number]

/** RTDS comment message types */
export type RtdsCommentType = (typeof RTDS_MESSAGE_TYPES.comments)[number]

/** RTDS RFQ message types */
export type RtdsRfqType = (typeof RTDS_MESSAGE_TYPES.rfq)[number]

/** RTDS price update type */
export type RtdsPriceType = 'update'

/** RTDS CLOB market message types */
export type RtdsClobMarketType = (typeof RTDS_MESSAGE_TYPES.clob_market)[number]

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if message is a trade message.
 *
 * @param msg - RTDS message to check
 * @returns True if message is a trade message
 */
export function isTradeMessage(msg: RtdsMessage): msg is RtdsTradeMessage {
	return msg.topic === 'activity' && msg.type === 'trades'
}

/**
 * Check if message is a crypto price message.
 *
 * @param msg - RTDS message to check
 * @returns True if message is a crypto price message
 */
export function isCryptoPriceMessage(msg: RtdsMessage): msg is RtdsCryptoPriceMessage {
	return msg.topic === 'crypto_prices' && msg.type === 'update'
}

/**
 * Check if message is a CLOB price change message.
 *
 * @param msg - RTDS message to check
 * @returns True if message is a CLOB price change message
 */
export function isClobPriceChangeMessage(msg: RtdsMessage): msg is RtdsClobPriceChangeMessage {
	return msg.topic === 'clob_market' && msg.type === 'price_change'
}

/**
 * Check if message is a CLOB aggregate orderbook message.
 *
 * @param msg - RTDS message to check
 * @returns True if message is a CLOB aggregate orderbook message
 */
export function isClobAggOrderbookMessage(msg: RtdsMessage): msg is RtdsClobAggOrderbookMessage {
	return msg.topic === 'clob_market' && msg.type === 'agg_orderbook'
}
