/**
 * Example: Watch real-time trading activity via RTDS WebSocket.
 *
 * Run with: bun examples/watch-activity.ts
 */

import * as p from '@clack/prompts'
import { bgBlue, black, cyan, dim, green, red, yellow } from 'colorette'

import {
	activitySubscription,
	ConnectionStatus,
	connectRtds,
	isTradeMessage,
	RTDS_MESSAGE_TYPES,
} from '../src'

import type { RtdsMessage, RtdsTradePayload } from '../src'

/**
 * Format a trade for display.
 *
 * @param trade - Trade payload
 * @returns Formatted trade string
 */
function formatTrade(trade: RtdsTradePayload): string {
	const side = trade.side === 'BUY' ? green('BUY ') : red('SELL')
	const price = `${(trade.price * 100).toFixed(1)}%`
	const size = `$${trade.size.toFixed(2)}`
	const user = trade.name || trade.pseudonym || 'Anon'

	return `${side} ${yellow(size.padStart(10))} @ ${cyan(price.padStart(6))} ${dim('|')} ${trade.outcome.slice(0, 20).padEnd(20)} ${dim('|')} ${dim(user.slice(0, 15))}`
}

/**
 * Watch trading activity in real-time.
 */
async function main(): Promise<void> {
	console.log()
	p.intro(bgBlue(black(' polymarket activity feed ')))

	p.log.info('Watching all trading activity...')

	const ws = p.spinner()
	ws.start('Connecting to RTDS...')

	let connected = false
	let tradeCount = 0

	const handle = connectRtds({
		subscriptions: [activitySubscription()],
		onMessage: (msg: RtdsMessage) => {
			const activityTypes: readonly string[] = RTDS_MESSAGE_TYPES.activity

			if (isTradeMessage(msg) && activityTypes.includes(msg.type)) {
				if (!connected) {
					ws.stop(`Connected - watching trades`)
					connected = true
					console.log()
					const header = 'SIDE       SIZE      PRICE   OUTCOME              USER'
					p.log.message(dim(header))
					p.log.message(dim('─'.repeat(header.length)))
				}

				tradeCount++
				p.log.message(formatTrade(msg.payload))
			}
		},
		onStatusChange: status => {
			if (status === ConnectionStatus.CONNECTED && !connected) {
				ws.stop('Connected - waiting for trades...')
				connected = true
				console.log()
			} else if (status === ConnectionStatus.DISCONNECTED && connected) {
				p.log.message(dim('Reconnecting...'))
			}
		},
	})

	p.log.message(dim('Press Ctrl+C to exit\n'))

	process.on('SIGINT', () => {
		console.log()
		handle.close()
		p.outro(green(`Watched ${tradeCount} trades`))
		process.exit(0)
	})

	await new Promise(() => {})
}

main().catch(err => {
	p.cancel(err.message)
	process.exit(1)
})
