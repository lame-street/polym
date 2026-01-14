import type {
	AlertMessage,
	AlertProvider,
	AlertResult,
	AlertSeverity,
	DiscordProviderConfig,
} from '../types'

/**
 * Map severity to Discord embed color.
 *
 * @param severity - Alert severity level
 * @returns Discord embed color as hex number
 */
function severityToColor(severity: AlertSeverity): number {
	switch (severity) {
		case 'success':
			return 0x22c55e // green
		case 'warning':
			return 0xeab308 // yellow
		case 'error':
			return 0xef4444 // red
		case 'info':
		default:
			return 0x3b82f6 // blue
	}
}

/**
 * Discord alert provider using webhooks.
 */
export class DiscordProvider implements AlertProvider {
	readonly type = 'discord'
	readonly name: string

	private readonly webhookUrl: string
	private readonly username: string
	private readonly avatarUrl?: string

	constructor(config: DiscordProviderConfig) {
		this.webhookUrl = config.webhookUrl
		this.name = config.name ?? 'Discord'
		this.username = config.username ?? 'polym'
		this.avatarUrl = config.avatarUrl
	}

	/**
	 * Send an alert to Discord via webhook.
	 *
	 * @param message - The alert to send
	 * @returns Result indicating success or failure
	 */
	async send(message: AlertMessage): Promise<AlertResult> {
		const embed = {
			title: message.title,
			description: message.body,
			color: severityToColor(message.severity ?? 'info'),
			timestamp: (message.timestamp ?? new Date()).toISOString(),
			url: message.url,
			fields: message.fields
				? Object.entries(message.fields).map(([name, value]) => ({
						name,
						value: String(value),
						inline: true,
					}))
				: undefined,
		}

		const payload = {
			username: this.username,
			avatar_url: this.avatarUrl,
			embeds: [embed],
		}

		try {
			const response = await fetch(this.webhookUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				const text = await response.text()
				return { success: false, error: `Discord API error: ${response.status} ${text}` }
			}

			return { success: true }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			}
		}
	}

	/**
	 * Check if the webhook URL is configured.
	 *
	 * @returns True if the provider can send messages
	 */
	isHealthy(): Promise<boolean> {
		return Promise.resolve(Boolean(this.webhookUrl))
	}
}
