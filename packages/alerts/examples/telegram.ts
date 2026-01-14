/**
 * Example: Send alerts to Telegram via Bot API.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... bun examples/telegram.ts
 */

import { runStep } from '@polym/utils/server'

import { TelegramProvider } from '../src'

const botToken = process.env.TELEGRAM_BOT_TOKEN
const chatId = process.env.TELEGRAM_CHAT_ID

if (!botToken || !chatId) {
	console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables')
	process.exit(1)
}

const telegram = new TelegramProvider({
	botToken,
	chatId,
})

const alerts = [
	{
		title: 'Bot Started',
		body: 'Market making bot is now running',
		severity: 'info' as const,
	},
	{
		title: 'Order Filled',
		body: 'Your buy order was filled',
		severity: 'success' as const,
		fields: {
			Market: 'Will X happen by 2025?',
			Side: 'BUY',
			Size: 100,
			Price: 0.65,
		},
		url: 'https://polymarket.com/event/example',
	},
	{
		title: 'High Volatility Detected',
		body: 'Market volatility exceeds threshold, pausing new orders',
		severity: 'warning' as const,
		fields: {
			Market: 'Will X happen by 2025?',
			Volatility: '15%',
		},
	},
	{
		title: 'Stop Loss Triggered',
		body: 'Position closed due to stop loss',
		severity: 'error' as const,
		fields: {
			Market: 'Will X happen by 2025?',
			Loss: '-$25.00',
		},
	},
]

for (const alert of alerts) {
	await runStep(
		`Sending: ${alert.title}`,
		async () => {
			const result = await telegram.send(alert)
			if (!result.success) {
				throw new Error(result.error ?? 'Unknown error')
			}
			return result
		},
		result => `Sent: ${alert.title} (message_id: ${result.messageId})`,
	)
}

console.log()
await runStep('Done!')
