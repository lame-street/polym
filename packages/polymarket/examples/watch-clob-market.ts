/**
 * Example: Watch CLOB market order book updates via RTDS WebSocket.
 *
 * Run with: bun examples/watch-clob-market.ts
 */

import * as p from '@clack/prompts'
import { bgGreen, black, cyan, dim, green, red, yellow } from 'colorette'

import {
	clobMarketSubscription,
	ConnectionStatus,
	connectRtds,
	GammaClient,
	isClobAggOrderbookMessage,
	isClobPriceChangeMessage,
} from '../src'

import type { RtdsMessage } from '../src'

/**
 * Watch a market's order book via RTDS.
 */
async function main(): Promise<void> {
	console.log()
	p.intro(bgGreen(black(' clob market feed ')))

	const gamma = new GammaClient()

	const s = p.spinner()
	s.start('Loading markets...')

	const markets = await gamma.getMarkets({ limit: 10, order: 'volume24hr' })
	const marketsWithTokens = markets.filter(m => m.tokenIds.length > 0)

	s.stop(`Found ${marketsWithTokens.length} markets`)

	if (marketsWithTokens.length === 0) {
		p.cancel('No markets with tokens found')
		process.exit(1)
	}

	const selectedId = await p.select({
		message: 'Select a market to watch:',
		options: marketsWithTokens.map(m => ({
			value: m.id,
			label: `${m.question.slice(0, 50)}${m.question.length > 50 ? '...' : ''} ${dim(`[$${Math.round(m.liquidity).toLocaleString()}]`)}`,
		})),
	})

	if (p.isCancel(selectedId)) {
		p.outro(dim('Cancelled'))
		return
	}

	const market = marketsWithTokens.find(m => m.id === selectedId)!

	p.log.info(`Watching: ${cyan(market.question)}`)
	p.log.message(dim(`Outcomes: ${market.outcomes.join(' / ')}`))

	const ws = p.spinner()
	ws.start('Connecting to RTDS...')

	let connected = false
	let updateCount = 0

	const handle = connectRtds({
		subscriptions: [clobMarketSubscription(market.tokenIds)],
		onMessage: (msg: RtdsMessage) => {
			if (msg.topic !== 'clob_market') return

			if (!connected) {
				ws.stop('Connected - receiving updates')
				connected = true
			}

			updateCount++
			const time = new Date().toLocaleTimeString()

			if (isClobPriceChangeMessage(msg)) {
				for (const pc of msg.payload.pc) {
					const tokenIndex = market.tokenIds.indexOf(pc.a)
					const outcome = tokenIndex >= 0 ? market.outcomes[tokenIndex] : '?'
					const side = pc.si === 'BUY' ? green('BUY ') : red('SELL')
					const price = `${(Number(pc.p) * 100).toFixed(1)}%`
					const size = `$${Number(pc.s).toFixed(0)}`

					p.log.message(
						`${dim(time)} ${side} ${yellow(size.padStart(6))} @ ${cyan(price.padStart(6))} ${dim('|')} ${outcome}`,
					)
				}
			} else if (isClobAggOrderbookMessage(msg)) {
				p.log.message(`${dim(time)} ${dim('[orderbook snapshot]')}`)
			} else {
				p.log.message(`${dim(time)} ${dim('[unknown clob_market message]')}`)
			}
		},
		onStatusChange: status => {
			if (status === ConnectionStatus.CONNECTED && !connected) {
				ws.stop('Connected - waiting for updates...')
				connected = true
			} else if (status === ConnectionStatus.DISCONNECTED && connected) {
				p.log.message(dim('Reconnecting...'))
			}
		},
	})

	p.log.message(dim('Press Ctrl+C to exit\n'))

	process.on('SIGINT', () => {
		handle.close()
		p.outro(green(`Received ${updateCount} updates`))
		process.exit(0)
	})

	await new Promise(() => {})
}

main().catch(err => {
	p.cancel(err.message)
	process.exit(1)
})
