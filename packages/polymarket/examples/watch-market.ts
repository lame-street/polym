/**
 * Example: Watch a market via WebSocket for real-time updates.
 *
 * Run with: bun examples/watch-market.ts
 */

import * as p from '@clack/prompts'
import { bgCyan, black, cyan, dim, green } from 'colorette'

import { connectPublicMarketWebSocket, GammaClient } from '../src'

import type { GammaMarket } from '../src'

/**
 * Format a market for display in the selection list.
 *
 * @param market - The market to format
 * @returns Formatted string with question and prices
 */
function formatMarket(market: GammaMarket): string {
	const prices = market.outcomePrices.map(pr => `${(pr * 100).toFixed(0)}%`).join('/')

	return `${market.question.slice(0, 60)}${market.question.length > 60 ? '...' : ''} ${dim(`[${prices}]`)}`
}

/**
 * Watch a market for real-time updates via WebSocket.
 */
async function main(): Promise<void> {
	console.log()
	p.intro(bgCyan(black(' polymarket watcher ')))

	const gamma = new GammaClient()

	const s = p.spinner()
	s.start('Loading active markets...')

	const markets = await gamma.getMarkets({ limit: 10, order: 'liquidity' })

	const marketsWithTokens = markets.filter(m => m.tokenIds.length > 0)

	s.stop(`Found ${green(String(marketsWithTokens.length))} active markets`)

	if (marketsWithTokens.length === 0) {
		p.cancel('No active markets with tokens found')
		process.exit(1)
	}

	const selected = await p.select({
		message: 'Select a market to watch:',
		options: marketsWithTokens.map(market => ({
			value: market.id,
			label: formatMarket(market),
		})),
	})

	if (p.isCancel(selected)) {
		p.cancel('Cancelled')
		process.exit(0)
	}

	const market = marketsWithTokens.find(m => m.id === selected)!

	p.log.info(`Watching ${cyan(market.question)}`)
	p.log.message(dim(`Outcomes: ${market.outcomes.join(' / ')}`))
	p.log.message(
		dim(`Prices: ${market.outcomePrices.map(pr => `${(pr * 100).toFixed(1)}%`).join(' / ')}`),
	)

	const ws = p.spinner()
	ws.start('Connecting to WebSocket...')

	let connected = false

	const handle = connectPublicMarketWebSocket({
		tokenIds: market.tokenIds,
		onMessage: updates => {
			if (!connected) {
				ws.stop('Connected')
				connected = true
				console.log()
			}

			for (const update of updates) {
				const tokenIndex = market.tokenIds.indexOf(update.asset_id)
				const outcome = market.outcomes[tokenIndex] ?? 'Unknown'
				const bestBid = update.bids[0]?.price ?? '-'
				const bestAsk = update.asks[0]?.price ?? '-'
				const timestamp = new Date().toLocaleTimeString()

				console.log(
					dim(`[${timestamp}]`),
					cyan(outcome.padEnd(8)),
					`bid ${green(bestBid)} / ask ${green(bestAsk)}`,
					dim(`(${update.bids.length} bids, ${update.asks.length} asks)`),
				)
			}
		},
		onError: error => {
			ws.stop('WebSocket error')
			p.log.error(error.message)
		},
		onClose: () => {
			console.log(dim('\nWebSocket closed'))
		},
	})

	// Handle Ctrl+C
	process.on('SIGINT', () => {
		console.log()
		handle.close()
		p.outro(dim('Stopped watching'))
		process.exit(0)
	})

	// Keep alive
	await new Promise(() => {})
}

main().catch(err => {
	p.cancel(err.message)
	process.exit(1)
})
