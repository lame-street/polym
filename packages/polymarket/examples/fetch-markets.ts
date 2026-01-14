/**
 * Example: Fetch and explore active markets from the Gamma API.
 *
 * Run with: bun examples/fetch-markets.ts
 */

import * as p from '@clack/prompts'
import { bgCyan, black, cyan, dim, green, yellow } from 'colorette'

import { GammaClient } from '../src'

import type { GammaMarket } from '../src'

/**
 * Format a market for display in the selection list.
 *
 * @param market - The market to format
 * @returns Formatted string with question and prices
 */
function formatMarket(market: GammaMarket): string {
	const prices = market.outcomePrices.map(pr => `${(pr * 100).toFixed(0)}%`).join('/')

	return `${market.question.slice(0, 55)}${market.question.length > 55 ? '...' : ''} ${dim(`[${prices}]`)}`
}

/**
 * Format a number as currency.
 *
 * @param value - The number to format
 * @returns Formatted currency string
 */
function formatCurrency(value: number): string {
	if (value >= 1_000_000) {
		return `$${(value / 1_000_000).toFixed(2)}M`
	}
	if (value >= 1_000) {
		return `$${(value / 1_000).toFixed(1)}K`
	}

	return `$${value.toFixed(2)}`
}

/**
 * Display detailed market information.
 *
 * @param market - The market to display
 */
function displayMarket(market: GammaMarket): void {
	console.log()
	p.log.info(cyan(market.question))
	console.log()

	// Outcomes and prices
	for (let i = 0; i < market.outcomes.length; i++) {
		const outcome = market.outcomes[i]!
		const price = market.outcomePrices[i] ?? 0
		const pct = (price * 100).toFixed(1)
		const bar = '█'.repeat(Math.round(price * 20))
		const emptyBar = '░'.repeat(20 - Math.round(price * 20))

		console.log(`  ${outcome.padEnd(10)} ${green(bar)}${dim(emptyBar)} ${yellow(pct + '%')}`)
	}

	console.log()
	console.log(`  ${dim('Volume:')}     ${formatCurrency(market.volume)}`)
	console.log(`  ${dim('Liquidity:')}  ${formatCurrency(market.liquidity)}`)
	console.log(`  ${dim('End Date:')}   ${new Date(market.endDate).toLocaleDateString()}`)
	console.log(`  ${dim('Market ID:')} ${market.id}`)
	console.log()
}

/**
 * Fetch and display active markets.
 */
async function main(): Promise<void> {
	console.log()
	p.intro(bgCyan(black(' polymarket explorer ')))

	const gamma = new GammaClient()

	const s = p.spinner()
	s.start('Loading active markets...')

	const markets = await gamma.getMarkets({ limit: 10, order: 'volume' })

	const marketsWithTokens = markets.filter(m => m.tokenIds.length > 0)

	s.stop(`Found ${green(String(marketsWithTokens.length))} markets (by volume)`)

	if (marketsWithTokens.length === 0) {
		p.cancel('No active markets found')
		process.exit(1)
	}

	let running = true

	while (running) {
		const selected = await p.select({
			message: 'Select a market to view details:',
			options: [
				...marketsWithTokens.map(market => ({
					value: String(market.id),
					label: formatMarket(market),
				})),
				{ value: '__exit__', label: dim('Exit') },
			],
		})

		if (p.isCancel(selected) || selected === '__exit__') {
			running = false
		} else {
			const market = marketsWithTokens.find(m => String(m.id) === selected)
			if (market) {
				displayMarket(market)
			}
		}
	}

	p.outro(dim('Goodbye'))
}

main().catch(err => {
	p.cancel(err.message)
	process.exit(1)
})
