/**
 * Example: Watch real-time crypto prices via RTDS WebSocket.
 *
 * Run with: bun examples/watch-crypto-prices.ts
 */

import * as p from '@clack/prompts'
import { bgYellow, black, cyan, dim, green, red, yellow } from 'colorette'

import {
	ConnectionStatus,
	connectRtds,
	cryptoPricesSubscription,
	isCryptoPriceMessage,
} from '../src'

import type { RtdsMessage } from '../src'

/**
 * Watch crypto prices in real-time.
 */
async function main(): Promise<void> {
	console.log()
	p.intro(bgYellow(black(' crypto price feed ')))

	const symbols = await p.multiselect({
		message: 'Select crypto pairs to watch:',
		options: [
			{ value: 'BTCUSDT', label: 'BTC/USDT' },
			{ value: 'ETHUSDT', label: 'ETH/USDT' },
			{ value: 'SOLUSDT', label: 'SOL/USDT' },
			{ value: 'BNBUSDT', label: 'BNB/USDT' },
			{ value: 'XRPUSDT', label: 'XRP/USDT' },
			{ value: 'ADAUSDT', label: 'ADA/USDT' },
			{ value: 'DOGEUSDT', label: 'DOGE/USDT' },
			{ value: 'MATICUSDT', label: 'MATIC/USDT' },
		],
		required: true,
		initialValues: ['BTCUSDT', 'ETHUSDT'],
	})

	if (p.isCancel(symbols)) {
		p.outro(dim('Cancelled'))
		return
	}

	p.log.info(`Watching: ${cyan(symbols.join(', '))}`)

	const ws = p.spinner()
	ws.start('Connecting to RTDS...')

	let connected = false
	const prices = new Map<string, { price: number; lastPrice: number }>()

	const handle = connectRtds({
		subscriptions: symbols.map(s => cryptoPricesSubscription(s)),
		onMessage: (msg: RtdsMessage) => {
			// Use type guard - payload is already typed!
			if (!isCryptoPriceMessage(msg)) return

			const { symbol, value } = msg.payload

			if (!connected) {
				ws.stop('Connected - receiving prices')
				connected = true
				console.log()
			}

			const prev = prices.get(symbol)
			prices.set(symbol, { price: value, lastPrice: prev?.price ?? value })

			const time = new Date().toLocaleTimeString()
			const priceStr = `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

			let change = ''
			if (prev) {
				const diff = value - prev.price
				if (diff > 0) {
					change = green(` ▲ +${diff.toFixed(2)}`)
				} else if (diff < 0) {
					change = red(` ▼ ${diff.toFixed(2)}`)
				}
			}

			p.log.message(
				`${dim(time)} ${yellow(symbol.padEnd(10))} ${cyan(priceStr.padStart(12))}${change}`,
			)
		},
		onStatusChange: status => {
			if (status === ConnectionStatus.CONNECTED && !connected) {
				ws.stop('Connected - waiting for prices...')
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
		p.outro(green('Stopped watching prices'))
		process.exit(0)
	})

	await new Promise(() => {})
}

main().catch(err => {
	p.cancel(err.message)
	process.exit(1)
})
