/**
 * Example: Fetch positions for a wallet address.
 *
 * Run with: bun examples/fetch-positions.ts [wallet-address]
 */

import { DataClient, WalletAddress } from '../src'

/**
 * Fetch and display positions for a wallet address.
 */
async function main(): Promise<void> {
	const walletArg = process.argv[2]

	if (!walletArg) {
		console.log('Usage: bun examples/fetch-positions.ts <wallet-address>')
		console.log()
		console.log('Example:')
		console.log('  bun examples/fetch-positions.ts 0x1234...')
		return
	}

	const walletAddress = WalletAddress(walletArg)
	const data = new DataClient()

	console.log(`Fetching positions for ${walletAddress}...\n`)

	const [positions, totalValue] = await Promise.all([
		data.getPositions(walletAddress),
		data.getPositionValue(walletAddress),
	])

	if (positions.length === 0) {
		console.log('No positions found for this wallet.')
		return
	}

	console.log(`💼 Portfolio Value: $${totalValue.toLocaleString()}\n`)
	console.log(`📊 Positions (${positions.length}):`)

	for (const position of positions) {
		const value = position.size * position.avgPrice
		console.log(`   Token: ${String(position.tokenId).slice(0, 20)}...`)
		console.log(`   Size: ${position.size.toLocaleString()} shares`)
		console.log(`   Avg Price: ${(position.avgPrice * 100).toFixed(2)}%`)
		console.log(`   Value: $${value.toLocaleString()}`)
		console.log()
	}
}

main().catch(console.error)
