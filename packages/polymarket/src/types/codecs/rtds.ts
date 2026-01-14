/**
 * RTDS codecs - wire to domain conversion.
 */

import { ConditionId, TokenId } from '../ids'

import type {
	ClobAggOrderbookPayload,
	ClobPriceChangeEntry,
	ClobPriceChangePayload,
	RtdsClobAggOrderbookMessage,
	RtdsClobPriceChangeMessage,
	RtdsCommentCreatedMessage,
	RtdsCommentPayload,
	RtdsCommentRemovedMessage,
	RtdsCryptoPriceMessage,
	RtdsCryptoPricePayload,
	RtdsEquityPriceMessage,
	RtdsEquityPricePayload,
	RtdsMessage,
	RtdsReactionCreatedMessage,
	RtdsReactionPayload,
	RtdsReactionRemovedMessage,
	RtdsTradeMessage,
	RtdsTradePayload,
} from '../domain/websocket'
import type {
	ClobAggOrderbookPayloadWire,
	ClobPriceChangeEntryWire,
	ClobPriceChangePayloadWire,
	RtdsChainlinkPriceMessageWire,
	RtdsClobAggOrderbookMessageWire,
	RtdsClobPriceChangeMessageWire,
	RtdsCommentCreatedMessageWire,
	RtdsCommentPayloadWire,
	RtdsCommentRemovedMessageWire,
	RtdsCryptoPriceMessageWire,
	RtdsEquityPriceMessageWire,
	RtdsMessageBaseWire,
	RtdsReactionCreatedMessageWire,
	RtdsReactionPayloadWire,
	RtdsReactionRemovedMessageWire,
	RtdsTradeMessageWire,
	RtdsTradePayloadWire,
} from '../wire/rtds'

// ─────────────────────────────────────────────────────────────────────────────
// Payload Decoders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decode trade payload wire to domain type.
 *
 * @param wire - Wire payload
 * @returns Domain payload
 */
export function decodeTradePayload(wire: RtdsTradePayloadWire): RtdsTradePayload {
	return {
		...wire,
		asset: TokenId(wire.asset),
		conditionId: ConditionId(wire.conditionId),
	}
}

/**
 * Decode crypto price payload wire to domain type.
 *
 * @param wire - Wire payload
 * @returns Domain payload
 */
export function decodeCryptoPricePayload(
	wire: RtdsCryptoPriceMessageWire['payload'],
): RtdsCryptoPricePayload {
	return wire
}

/**
 * Decode equity price payload wire to domain type.
 *
 * @param wire - Wire payload
 * @returns Domain payload
 */
export function decodeEquityPricePayload(
	wire: RtdsEquityPriceMessageWire['payload'],
): RtdsEquityPricePayload {
	return wire
}

/**
 * Decode comment payload wire to domain type.
 *
 * @param wire - Wire payload
 * @returns Domain payload
 */
export function decodeCommentPayload(wire: RtdsCommentPayloadWire): RtdsCommentPayload {
	return wire
}

/**
 * Decode reaction payload wire to domain type.
 *
 * @param wire - Wire payload
 * @returns Domain payload
 */
export function decodeReactionPayload(wire: RtdsReactionPayloadWire): RtdsReactionPayload {
	return wire
}

/**
 * Decode CLOB price change entry wire to domain type.
 *
 * @param wire - Wire entry
 * @returns Domain entry
 */
export function decodeClobPriceChangeEntry(wire: ClobPriceChangeEntryWire): ClobPriceChangeEntry {
	return {
		a: TokenId(wire.a),
		ba: wire.ba,
		bb: wire.bb,
		p: wire.p,
		s: wire.s,
		si: wire.si,
		h: wire.h,
	}
}

/**
 * Decode CLOB price change payload wire to domain type.
 *
 * @param wire - Wire payload
 * @returns Domain payload
 */
export function decodeClobPriceChangePayload(
	wire: ClobPriceChangePayloadWire,
): ClobPriceChangePayload {
	return {
		m: ConditionId(wire.m),
		pc: wire.pc.map(decodeClobPriceChangeEntry),
		t: wire.t,
	}
}

/**
 * Decode CLOB aggregate orderbook payload wire to domain type.
 *
 * @param wire - Wire payload
 * @returns Domain payload
 */
export function decodeClobAggOrderbookPayload(
	wire: ClobAggOrderbookPayloadWire,
): ClobAggOrderbookPayload {
	return {
		m: ConditionId(wire.m),
		a: TokenId(wire.a),
		b: wire.b,
		ak: wire.ak,
		t: wire.t,
		h: wire.h,
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Decoders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decode trade message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
export function decodeTradeMessage(wire: RtdsTradeMessageWire): RtdsTradeMessage {
	return {
		topic: wire.topic,
		type: wire.type,
		timestamp: wire.timestamp,
		payload: decodeTradePayload(wire.payload),
	}
}

/**
 * Decode crypto price message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
export function decodeCryptoPriceMessage(wire: RtdsCryptoPriceMessageWire): RtdsCryptoPriceMessage {
	return {
		topic: wire.topic,
		type: wire.type,
		timestamp: wire.timestamp,
		payload: decodeCryptoPricePayload(wire.payload),
	}
}

/**
 * Decode chainlink price message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message (same as crypto price)
 */
export function decodeChainlinkPriceMessage(
	wire: RtdsChainlinkPriceMessageWire,
): RtdsCryptoPriceMessage {
	return {
		topic: 'crypto_prices',
		type: 'update',
		timestamp: wire.timestamp,
		payload: decodeCryptoPricePayload(wire.payload),
	}
}

/**
 * Decode equity price message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
export function decodeEquityPriceMessage(wire: RtdsEquityPriceMessageWire): RtdsEquityPriceMessage {
	return {
		topic: wire.topic,
		type: wire.type,
		timestamp: wire.timestamp,
		payload: decodeEquityPricePayload(wire.payload),
	}
}

/**
 * Decode comment created message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
export function decodeCommentCreatedMessage(
	wire: RtdsCommentCreatedMessageWire,
): RtdsCommentCreatedMessage {
	return {
		topic: wire.topic,
		type: wire.type,
		timestamp: wire.timestamp,
		payload: decodeCommentPayload(wire.payload),
	}
}

/**
 * Decode comment removed message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
export function decodeCommentRemovedMessage(
	wire: RtdsCommentRemovedMessageWire,
): RtdsCommentRemovedMessage {
	return {
		topic: wire.topic,
		type: wire.type,
		timestamp: wire.timestamp,
		payload: decodeCommentPayload(wire.payload),
	}
}

/**
 * Decode reaction created message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
export function decodeReactionCreatedMessage(
	wire: RtdsReactionCreatedMessageWire,
): RtdsReactionCreatedMessage {
	return {
		topic: wire.topic,
		type: wire.type,
		timestamp: wire.timestamp,
		payload: decodeReactionPayload(wire.payload),
	}
}

/**
 * Decode reaction removed message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
export function decodeReactionRemovedMessage(
	wire: RtdsReactionRemovedMessageWire,
): RtdsReactionRemovedMessage {
	return {
		topic: wire.topic,
		type: wire.type,
		timestamp: wire.timestamp,
		payload: decodeReactionPayload(wire.payload),
	}
}

/**
 * Decode CLOB price change message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
export function decodeClobPriceChangeMessage(
	wire: RtdsClobPriceChangeMessageWire,
): RtdsClobPriceChangeMessage {
	return {
		topic: wire.topic,
		type: wire.type,
		timestamp: wire.timestamp,
		payload: decodeClobPriceChangePayload(wire.payload),
	}
}

/**
 * Decode CLOB aggregate orderbook message wire to domain type.
 *
 * @param wire - Wire message
 * @returns Domain message
 */
export function decodeClobAggOrderbookMessage(
	wire: RtdsClobAggOrderbookMessageWire,
): RtdsClobAggOrderbookMessage {
	return {
		topic: wire.topic,
		type: wire.type,
		timestamp: wire.timestamp,
		payload: decodeClobAggOrderbookPayload(wire.payload),
	}
}

/**
 * Try to decode an RTDS message from base wire format to typed domain message.
 * Returns null if the message type is not recognized.
 *
 * @param wire - Base wire message
 * @returns Typed domain message or null
 */
export function tryDecodeRtdsMessage(wire: RtdsMessageBaseWire): RtdsMessage | null {
	const { topic, type } = wire

	// Activity messages
	if (topic === 'activity' && type === 'trades') {
		return decodeTradeMessage(wire as RtdsTradeMessageWire)
	}

	// Crypto price messages
	if (topic === 'crypto_prices' && type === 'update') {
		return decodeCryptoPriceMessage(wire as RtdsCryptoPriceMessageWire)
	}

	// Chainlink price messages (convert to crypto_prices for consistency)
	if (topic === 'crypto_prices_chainlink' && type === 'update') {
		return decodeChainlinkPriceMessage(wire as RtdsChainlinkPriceMessageWire)
	}

	// Equity price messages
	if (topic === 'equity_prices' && type === 'update') {
		return decodeEquityPriceMessage(wire as RtdsEquityPriceMessageWire)
	}

	// Comment messages
	if (topic === 'comments' && type === 'comment_created') {
		return decodeCommentCreatedMessage(wire as RtdsCommentCreatedMessageWire)
	}
	if (topic === 'comments' && type === 'comment_removed') {
		return decodeCommentRemovedMessage(wire as RtdsCommentRemovedMessageWire)
	}
	if (topic === 'comments' && type === 'reaction_created') {
		return decodeReactionCreatedMessage(wire as RtdsReactionCreatedMessageWire)
	}
	if (topic === 'comments' && type === 'reaction_removed') {
		return decodeReactionRemovedMessage(wire as RtdsReactionRemovedMessageWire)
	}

	// CLOB market messages
	if (topic === 'clob_market' && type === 'price_change') {
		return decodeClobPriceChangeMessage(wire as RtdsClobPriceChangeMessageWire)
	}
	if (topic === 'clob_market' && type === 'agg_orderbook') {
		return decodeClobAggOrderbookMessage(wire as RtdsClobAggOrderbookMessageWire)
	}

	// Unknown message type
	return null
}
