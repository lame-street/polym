import { expect, test } from 'bun:test'

import { createEngineState, findMarketByToken, isRiskOff } from './index'

import type { TokenId } from '@polym/sdk'

test('createEngineState initializes markets map', () => {
	const markets = [
		{
			conditionId: '0x123',
			question: 'Test',
			token1: 'T1',
			token2: 'T2',
			answer1: 'Yes',
			answer2: 'No',
			tickSize: 0.01,
			negRisk: false,
			maxSpread: 0.05,
			minSize: 1,
			tradeSize: 10,
			maxSize: 100,
		},
	]
	const state = createEngineState(markets)
	expect(state.markets.size).toBe(1)
	expect(state.subscribedTokens).toContain('T1' as TokenId)
	expect(state.subscribedTokens).toContain('T2' as TokenId)
})

test('findMarketByToken finds market by token1', () => {
	const markets = [
		{
			conditionId: '0x123',
			question: 'Test',
			token1: 'T1',
			token2: 'T2',
			answer1: 'Yes',
			answer2: 'No',
			tickSize: 0.01,
			negRisk: false,
			maxSpread: 0.05,
			minSize: 1,
			tradeSize: 10,
			maxSize: 100,
		},
	]
	const state = createEngineState(markets)
	const market = findMarketByToken(state, 'T1')
	expect(market?.config.conditionId).toBe('0x123')
})

test('findMarketByToken finds market by token2', () => {
	const markets = [
		{
			conditionId: '0x123',
			question: 'Test',
			token1: 'T1',
			token2: 'T2',
			answer1: 'Yes',
			answer2: 'No',
			tickSize: 0.01,
			negRisk: false,
			maxSpread: 0.05,
			minSize: 1,
			tradeSize: 10,
			maxSize: 100,
		},
	]
	const state = createEngineState(markets)
	const market = findMarketByToken(state, 'T2')
	expect(market?.config.conditionId).toBe('0x123')
})

test('findMarketByToken returns undefined for unknown token', () => {
	const state = createEngineState([])
	const market = findMarketByToken(state, 'UNKNOWN')
	expect(market).toBeUndefined()
})

test('isRiskOff returns false when riskOffUntil is null', () => {
	const market = { riskOffUntil: null } as any
	expect(isRiskOff(market)).toBe(false)
})

test('isRiskOff returns true when riskOffUntil is in future', () => {
	const market = { riskOffUntil: Date.now() + 10000 } as any
	expect(isRiskOff(market)).toBe(true)
})

test('isRiskOff returns false when riskOffUntil is in past', () => {
	const market = { riskOffUntil: Date.now() - 10000 } as any
	expect(isRiskOff(market)).toBe(false)
})
