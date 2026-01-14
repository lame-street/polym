import type {
	AlertMessage,
	AlertProvider,
	AlertResult,
	AlertSeverity,
	TelegramProviderConfig,
} from '../types'

/**
 * Map severity to emoji.
 *
 * @param severity - Alert severity level
 * @returns Emoji string for the severity
 */
function severityToEmoji(severity: AlertSeverity): string {
	switch (severity) {
		case 'success':
			return '✅'
		case 'warning':
			return '⚠️'
		case 'error':
			return '🚨'
		case 'info':
		default:
			return 'ℹ️'
	}
}

/**
 * Escape HTML special characters.
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML
 */
function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Telegram alert provider using the Bot API.
 */
export class TelegramProvider implements AlertProvider {
	readonly type = 'telegram'
	readonly name: string

	private readonly botToken: string
	private readonly chatId: string
	private readonly parseMode: 'HTML' | 'Markdown' | 'MarkdownV2'

	constructor(config: TelegramProviderConfig) {
		this.botToken = config.botToken
		this.chatId = config.chatId
		this.name = config.name ?? 'Telegram'
		this.parseMode = config.parseMode ?? 'HTML'
	}

	/**
	 * Send an alert to Telegram.
	 *
	 * @param message - The alert to send
	 * @returns Result indicating success or failure
	 */
	async send(message: AlertMessage): Promise<AlertResult> {
		const emoji = severityToEmoji(message.severity ?? 'info')
		const title = escapeHtml(message.title)
		const body = escapeHtml(message.body)

		let text = `${emoji} <b>${title}</b>\n\n${body}`

		if (message.fields && Object.keys(message.fields).length > 0) {
			const fieldLines = Object.entries(message.fields)
				.map(([key, value]) => `<b>${escapeHtml(key)}:</b> ${escapeHtml(String(value))}`)
				.join('\n')
			text += `\n\n${fieldLines}`
		}

		if (message.url) {
			text += `\n\n<a href="${message.url}">View Details</a>`
		}

		const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`
		const payload = {
			chat_id: this.chatId,
			text,
			parse_mode: this.parseMode,
			disable_web_page_preview: false,
		}

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			const data = (await response.json()) as { ok: boolean; result?: { message_id: number } }

			if (!data.ok) {
				return { success: false, error: `Telegram API error: ${JSON.stringify(data)}` }
			}

			return {
				success: true,
				messageId: data.result?.message_id?.toString(),
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			}
		}
	}

	/**
	 * Check if the bot token and chat ID are configured.
	 *
	 * @returns True if the provider can send messages
	 */
	isHealthy(): Promise<boolean> {
		return Promise.resolve(Boolean(this.botToken && this.chatId))
	}
}
