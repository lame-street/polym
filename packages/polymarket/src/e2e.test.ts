/**
 * End-to-end tests for public Polymarket API endpoints.
 *
 * These tests hit the actual Polymarket APIs - no mocking.
 * Run with: bun test e2e.test.ts
 */

import { describe, expect, test } from 'bun:test'

import { ClobPublicClient, DataClient, GammaClient } from './lib/rest'
import { WalletAddress } from './types/ids'

import type { TokenId } from './types/ids'

describe('Gamma API (public)', () => {
	const gamma = new GammaClient()

	test('getEvents returns array of events', async () => {
		const events = await gamma.getEvents({ limit: 5 })

		expect(Array.isArray(events)).toBe(true)
		expect(events.length).toBeGreaterThan(0)
		expect(events.length).toBeLessThanOrEqual(5)

		const event = events[0]
		expect(event).toHaveProperty('id')
		expect(event).toHaveProperty('title')
		expect(event).toHaveProperty('slug')
	})

	test('getMarkets returns array of markets', async () => {
		const markets = await gamma.getMarkets({ limit: 5 })

		expect(Array.isArray(markets)).toBe(true)
		expect(markets.length).toBeGreaterThan(0)
		expect(markets.length).toBeLessThanOrEqual(5)

		const market = markets[0]
		expect(market).toHaveProperty('id')
		expect(market).toHaveProperty('conditionId')
		expect(market).toHaveProperty('question')
		expect(market).toHaveProperty('outcomes')
		expect(market).toHaveProperty('outcomePrices')
	})

	test('getEvent returns single event by ID', async () => {
		const events = await gamma.getEvents({ limit: 1 })
		expect(events.length).toBeGreaterThan(0)

		const firstEvent = events[0]!
		const event = await gamma.getEvent(firstEvent.id)

		expect(event).toHaveProperty('id')
		expect(event.id).toBe(firstEvent.id)
		expect(event).toHaveProperty('title')
	})

	test('getMarket returns single market by ID', async () => {
		const markets = await gamma.getMarkets({ limit: 1 })
		expect(markets.length).toBeGreaterThan(0)

		// Use the numeric id, not conditionId
		const firstMarket = markets[0]!
		const market = await gamma.getMarket(firstMarket.id)

		expect(market).toHaveProperty('id')
		expect(market.id).toBe(firstMarket.id)
		expect(market).toHaveProperty('question')
	})
})

describe('CLOB Public API', () => {
	const clob = new ClobPublicClient()
	const gamma = new GammaClient()

	// We need a valid token ID for CLOB tests
	let tokenId: TokenId | null = null

	test('setup: get a valid token ID from Gamma', async () => {
		const markets = await gamma.getMarkets({ limit: 10 })
		expect(markets.length).toBeGreaterThan(0)

		// Find a market with tokenIds (already parsed by the client)
		const marketWithTokens = markets.find(m => m.tokenIds.length > 0)

		if (marketWithTokens) {
			tokenId = marketWithTokens.tokenIds[0] ?? null
		}

		expect(tokenId).toBeDefined()
	})

	test('getOrderBook returns bids and asks', async () => {
		if (!tokenId) return

		const orderBook = await clob.getOrderBook(tokenId)

		expect(orderBook).toHaveProperty('bids')
		expect(orderBook).toHaveProperty('asks')
		expect(Array.isArray(orderBook.bids)).toBe(true)
		expect(Array.isArray(orderBook.asks)).toBe(true)
	})

	test('getMidpoint returns a number', async () => {
		if (!tokenId) return

		const midpoint = await clob.getMidpoint(tokenId)

		expect(typeof midpoint).toBe('number')
		expect(midpoint).toBeGreaterThanOrEqual(0)
		expect(midpoint).toBeLessThanOrEqual(1)
	})

	test('getPrice returns a number for buy side', async () => {
		if (!tokenId) return

		const price = await clob.getPrice(tokenId, 'BUY')

		expect(typeof price).toBe('number')
		expect(price).toBeGreaterThanOrEqual(0)
		expect(price).toBeLessThanOrEqual(1)
	})

	test('getPrice returns a number for sell side', async () => {
		if (!tokenId) return

		const price = await clob.getPrice(tokenId, 'SELL')

		expect(typeof price).toBe('number')
		expect(price).toBeGreaterThanOrEqual(0)
		expect(price).toBeLessThanOrEqual(1)
	})

	test('getSpread returns a number', async () => {
		if (!tokenId) return

		const spread = await clob.getSpread(tokenId)

		expect(typeof spread).toBe('number')
		expect(spread).toBeGreaterThanOrEqual(0)
	})
})

describe('Data API (public)', () => {
	const data = new DataClient()

	// Use a known wallet that likely has positions
	// We'll use a generic address that may or may not have positions
	const testWalletAddress = WalletAddress('0x0000000000000000000000000000000000000001')

	test('getPositions returns array (may be empty)', async () => {
		const positions = await data.getPositions(testWalletAddress)

		expect(Array.isArray(positions)).toBe(true)

		if (positions.length > 0) {
			const position = positions[0]!
			expect(position).toHaveProperty('tokenId')
			expect(position).toHaveProperty('size')
			expect(position).toHaveProperty('avgPrice')
			expect(typeof position.size).toBe('number')
			expect(typeof position.avgPrice).toBe('number')
		}
	})

	test('getPositionValue returns a number', async () => {
		const value = await data.getPositionValue(testWalletAddress)

		expect(typeof value).toBe('number')
		expect(value).toBeGreaterThanOrEqual(0)
	})
})
