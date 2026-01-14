/**
 * Example: Broadcast alerts to multiple providers at once.
 *
 * Usage:
 *   DISCORD_WEBHOOK=... TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... bun examples/broadcaster.ts
 */

import { runStep } from '@polym/utils/server'

import { AlertBroadcaster, DiscordProvider, TelegramProvider } from '../src'

import type { AlertProvider } from '../src'

const providers: AlertProvider[] = []

if (process.env.DISCORD_WEBHOOK) {
	providers.push(
		new DiscordProvider({
			webhookUrl: process.env.DISCORD_WEBHOOK,
			username: 'polym',
		}),
	)
}

if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
	providers.push(
		new TelegramProvider({
			botToken: process.env.TELEGRAM_BOT_TOKEN,
			chatId: process.env.TELEGRAM_CHAT_ID,
		}),
	)
}

if (providers.length === 0) {
	console.error(
		'No providers configured. Set DISCORD_WEBHOOK or TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID',
	)
	process.exit(1)
}

const broadcaster = new AlertBroadcaster(providers)

console.log(`Broadcasting to ${broadcaster.count} provider(s)...`)
console.log()

await runStep(
	'Checking provider health',
	async () => {
		const health = await broadcaster.healthCheck()
		const unhealthy = [...health.entries()].filter(([, ok]) => !ok)
		if (unhealthy.length > 0) {
			throw new Error(`Unhealthy: ${unhealthy.map(([name]) => name).join(', ')}`)
		}
		return health
	},
	result => `All ${result.size} provider(s) healthy`,
)

const alerts = [
	{
		title: 'Bot Started',
		body: 'Market making bot is now running',
		severity: 'info' as const,
	},
]

for (const alert of alerts) {
	await runStep(
		`Broadcasting: ${alert.title}`,
		async () => {
			const result = await broadcaster.send(alert)
			if (!result.allSucceeded) {
				const failures = result.results
					.filter(r => !r.result.success)
					.map(r => `${r.provider}: ${r.result.error}`)
				throw new Error(failures.join('; '))
			}
			return result
		},
		result => `Sent to ${result.successCount} provider(s)`,
	)
}

console.log()
await runStep('Done!')
