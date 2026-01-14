/**
 * Example: Fetch order book and pricing data from the CLOB API.
 *
 * Run with: bun examples/fetch-orderbook.ts
 */

import { ClobPublicClient, GammaClient } from '../src'

/**
 * Fetch and display order book data for an active market.
 */
async function main(): Promise<void> {
	const gamma = new GammaClient()
	const clob = new ClobPublicClient()

	// First, find an active market with tokens
	console.log('Finding an active market...\n')

	const markets = await gamma.getMarkets({ limit: 10, order: 'volume' })

	const market = markets.find(m => m.tokenIds.length > 0)

	if (!market) {
		console.log('No active markets with tokens found')
		return
	}

	console.log(`📊 ${market.question}`)
	console.log(`   Outcomes: ${market.outcomes.join(' / ')}\n`)

	// Fetch order book for the first token (usually "Yes")
	const tokenId = market.tokenIds[0]!

	console.log(`Fetching order book for "${market.outcomes[0]}"...\n`)

	const [orderBook, midpoint, buyPrice, sellPrice, spread] = await Promise.all([
		clob.getOrderBook(tokenId),
		clob.getMidpoint(tokenId),
		clob.getPrice(tokenId, 'BUY'),
		clob.getPrice(tokenId, 'SELL'),
		clob.getSpread(tokenId),
	])

	console.log('💰 Pricing:')
	console.log(`   Midpoint: ${(midpoint * 100).toFixed(2)}%`)
	console.log(`   Best Bid: ${(buyPrice * 100).toFixed(2)}%`)
	console.log(`   Best Ask: ${(sellPrice * 100).toFixed(2)}%`)
	console.log(`   Spread: ${(spread * 100).toFixed(2)}%`)
	console.log()

	console.log('📖 Order Book (top 5 levels):')
	console.log('   Bids:')
	for (const bid of orderBook.bids.slice(0, 5)) {
		console.log(`     ${(bid.price * 100).toFixed(1)}% - ${bid.size} shares`)
	}
	console.log('   Asks:')
	for (const ask of orderBook.asks.slice(0, 5)) {
		console.log(`     ${(ask.price * 100).toFixed(1)}% - ${ask.size} shares`)
	}
}

main().catch(console.error)
