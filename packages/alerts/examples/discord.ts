/**
 * Example: Send alerts to Discord via webhook.
 *
 * Usage:
 *   DISCORD_WEBHOOK=https://discord.com/api/webhooks/... bun examples/discord.ts
 */

import { runStep } from '@polym/utils/server'

import { DiscordProvider } from '../src'

const webhookUrl = process.env.DISCORD_WEBHOOK

if (!webhookUrl) {
	console.error('Missing DISCORD_WEBHOOK environment variable')
	process.exit(1)
}

const discord = new DiscordProvider({
	webhookUrl,
	username: 'polym',
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
			const result = await discord.send(alert)
			if (!result.success) {
				throw new Error(result.error ?? 'Unknown error')
			}
			return result
		},
		`Sent: ${alert.title}`,
	)
}

console.log()
await runStep('Done!')
