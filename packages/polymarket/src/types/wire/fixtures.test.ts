/**
 * Fixture tests for wire schemas.
 *
 * These tests validate that our Zod schemas correctly parse
 * real-world API responses. Add new fixtures as you encounter
 * edge cases or new message formats.
 */

import { describe, expect, test } from 'bun:test'

import {
	midpointWireSchema,
	orderbookWireSchema,
	priceWireSchema,
	spreadWireSchema,
} from './clob-rest'
import { positionsWireSchema, valueWireSchema } from './data-rest'
import { gammaEventWireSchema, gammaMarketWireSchema } from './gamma'
import {
	rtdsClobAggOrderbookMessageWireSchema,
	rtdsClobPriceChangeMessageWireSchema,
	rtdsCryptoPriceMessageWireSchema,
	rtdsTradeMessageWireSchema,
} from './rtds'
import { marketBookUpdateWireSchema, marketMessageWireSchema } from './ws-market'
import { userMessageWireSchema } from './ws-user'

// ─────────────────────────────────────────────────────────────────────────────
// Gamma API Fixtures
// ─────────────────────────────────────────────────────────────────────────────

describe('Gamma wire schemas', () => {
	test('gammaMarketWireSchema parses valid market', () => {
		const fixture = {
			id: '12345',
			conditionId: '0xabc123',
			question: 'Will BTC exceed $100k by end of 2025?',
			description: 'Resolution based on Coinbase price.',
			outcomes: '["Yes","No"]',
			outcomePrices: '["0.65","0.35"]',
			volume: '1500000.00',
			liquidity: '250000.00',
			endDate: '2025-12-31T23:59:59Z',
			active: true,
			closed: false,
			clobTokenIds: '["token1","token2"]',
		}

		const result = gammaMarketWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.id).toBe('12345')
			expect(result.data.outcomes).toBe('["Yes","No"]')
		}
	})

	test('gammaMarketWireSchema allows missing clobTokenIds', () => {
		const fixture = {
			id: '12345',
			conditionId: '0xabc123',
			question: 'Test question',
			description: 'Test description',
			outcomes: '["Yes","No"]',
			outcomePrices: '["0.5","0.5"]',
			volume: '0',
			liquidity: '0',
			endDate: '2025-12-31T23:59:59Z',
			active: true,
			closed: false,
		}

		const result = gammaMarketWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('gammaEventWireSchema parses valid event', () => {
		const fixture = {
			id: '999',
			title: 'Bitcoin Price Predictions 2025',
			slug: 'btc-2025',
			description: 'Markets related to BTC price in 2025.',
			startDate: '2024-01-01T00:00:00Z',
			endDate: '2025-12-31T23:59:59Z',
			active: true,
			closed: false,
		}

		const result = gammaEventWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})
})

// ─────────────────────────────────────────────────────────────────────────────
// CLOB REST Fixtures
// ─────────────────────────────────────────────────────────────────────────────

describe('CLOB REST wire schemas', () => {
	test('orderbookWireSchema parses valid orderbook', () => {
		const fixture = {
			bids: [
				{ price: '0.65', size: '100' },
				{ price: '0.64', size: '200' },
			],
			asks: [
				{ price: '0.66', size: '150' },
				{ price: '0.67', size: '250' },
			],
		}

		const result = orderbookWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('orderbookWireSchema accepts number values', () => {
		const fixture = {
			bids: [{ price: 0.65, size: 100 }],
			asks: [{ price: 0.66, size: 150 }],
		}

		const result = orderbookWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('midpointWireSchema parses valid midpoint', () => {
		const fixture = { mid: '0.655' }

		const result = midpointWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.mid).toBe('0.655')
		}
	})

	test('priceWireSchema parses valid price', () => {
		const fixture = { price: '0.65' }

		const result = priceWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('spreadWireSchema parses valid spread', () => {
		const fixture = { spread: '0.01' }

		const result = spreadWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})
})

// ─────────────────────────────────────────────────────────────────────────────
// Data API Fixtures
// ─────────────────────────────────────────────────────────────────────────────

describe('Data REST wire schemas', () => {
	test('positionsWireSchema parses valid positions', () => {
		const fixture = [
			{ asset: 'token1', size: '100.5', avgPrice: '0.65' },
			{ asset: 'token2', size: '50', avgPrice: '0.30' },
		]

		const result = positionsWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.length).toBe(2)
		}
	})

	test('positionsWireSchema parses empty array', () => {
		const fixture: unknown[] = []

		const result = positionsWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('valueWireSchema parses valid value response', () => {
		const fixture = [{ user: '0x1234', value: 1500.5 }]

		const result = valueWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data[0]!.value).toBe(1500.5)
		}
	})
})

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket Market Fixtures
// ─────────────────────────────────────────────────────────────────────────────

describe('Market WebSocket wire schemas', () => {
	test('marketBookUpdateWireSchema parses valid update', () => {
		const fixture = {
			market: '0xabc123',
			asset_id: 'token1',
			hash: 'abc123',
			timestamp: '1699900000000',
			bids: [{ price: '0.65', size: '100' }],
			asks: [{ price: '0.66', size: '150' }],
		}

		const result = marketBookUpdateWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('marketMessageWireSchema parses array of updates', () => {
		const fixture = [
			{
				market: '0xabc123',
				asset_id: 'token1',
				hash: 'abc123',
				timestamp: '1699900000000',
				bids: [{ price: '0.65', size: '100' }],
				asks: [{ price: '0.66', size: '150' }],
			},
		]

		const result = marketMessageWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})
})

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket User Fixtures
// ─────────────────────────────────────────────────────────────────────────────

describe('User WebSocket wire schemas', () => {
	test('userMessageWireSchema parses order_placed', () => {
		const fixture = {
			type: 'order_placed',
			order: {
				id: 'order123',
				asset_id: 'token1',
				side: 'BUY',
				price: '0.65',
				original_size: '100',
				size_matched: '0',
			},
		}

		const result = userMessageWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('userMessageWireSchema parses order_matched', () => {
		const fixture = {
			type: 'order_matched',
			orderId: 'order123',
			sizeMatched: '50',
		}

		const result = userMessageWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('userMessageWireSchema parses order_cancelled', () => {
		const fixture = {
			type: 'order_cancelled',
			orderId: 'order123',
		}

		const result = userMessageWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('userMessageWireSchema parses trade', () => {
		const fixture = {
			type: 'trade',
			tokenId: 'token1',
			side: 'SELL',
			price: '0.65',
			size: '100',
		}

		const result = userMessageWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})
})

// ─────────────────────────────────────────────────────────────────────────────
// RTDS Fixtures
// ─────────────────────────────────────────────────────────────────────────────

describe('RTDS wire schemas', () => {
	test('rtdsTradeMessageWireSchema parses valid trade', () => {
		const fixture = {
			topic: 'activity',
			type: 'trades',
			timestamp: 1699900000000,
			payload: {
				asset: 'token1',
				bio: 'Trader bio',
				conditionId: '0xabc123',
				eventSlug: 'btc-2025',
				icon: 'https://example.com/icon.png',
				name: 'Trader Name',
				outcome: 'Yes',
				outcomeIndex: 0,
				price: 0.65,
				profileImage: 'https://example.com/profile.png',
				proxyWallet: '0x1234',
				pseudonym: 'TraderX',
				side: 'BUY',
				size: 100,
				slug: 'btc-100k',
				timestamp: 1699900000000,
				title: 'BTC $100k',
				transactionHash: '0xhash123',
			},
		}

		const result = rtdsTradeMessageWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('rtdsCryptoPriceMessageWireSchema parses valid price update', () => {
		const fixture = {
			topic: 'crypto_prices',
			type: 'update',
			timestamp: 1699900000000,
			payload: {
				symbol: 'BTCUSDT',
				timestamp: 1699900000000,
				value: 45000.5,
			},
		}

		const result = rtdsCryptoPriceMessageWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('rtdsClobPriceChangeMessageWireSchema parses valid price change', () => {
		const fixture = {
			topic: 'clob_market',
			type: 'price_change',
			timestamp: 1699900000000,
			payload: {
				m: '0xabc123',
				pc: [
					{
						a: 'token1',
						ba: '0.66',
						bb: '0.65',
						p: '0.655',
						s: '100',
						si: 'BUY',
						h: 'hash123',
					},
				],
				t: '1699900000000',
			},
		}

		const result = rtdsClobPriceChangeMessageWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})

	test('rtdsClobAggOrderbookMessageWireSchema parses valid orderbook', () => {
		const fixture = {
			topic: 'clob_market',
			type: 'agg_orderbook',
			timestamp: 1699900000000,
			payload: {
				m: '0xabc123',
				a: 'token1',
				b: [{ p: '0.65', s: '100' }],
				ak: [{ p: '0.66', s: '150' }],
				t: '1699900000000',
				h: 'hash123',
			},
		}

		const result = rtdsClobAggOrderbookMessageWireSchema.safeParse(fixture)
		expect(result.success).toBe(true)
	})
})
