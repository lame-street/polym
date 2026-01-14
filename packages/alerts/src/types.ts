/**
 * Severity level for an alert.
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'success'

/**
 * A unified alert message that can be sent to any provider.
 */
export interface AlertMessage {
	/** Short title/subject for the alert */
	title: string
	/** Main body text */
	body: string
	/** Optional severity level (default: 'info') */
	severity?: AlertSeverity
	/** Optional metadata fields (rendered as key-value pairs) */
	fields?: Record<string, string | number | boolean>
	/** Optional URL to link to */
	url?: string
	/** Optional timestamp (default: now) */
	timestamp?: Date
}

/**
 * Result of sending an alert.
 */
export interface AlertResult {
	/** Whether the alert was sent successfully */
	success: boolean
	/** Provider-specific message ID if available */
	messageId?: string
	/** Error message if failed */
	error?: string
}

/**
 * Configuration shared by all providers.
 */
export interface AlertProviderConfig {
	/** Human-readable name for this provider instance */
	name?: string
	/** Whether this provider is enabled (default: true) */
	enabled?: boolean
}

/**
 * Discord-specific configuration.
 */
export interface DiscordProviderConfig extends AlertProviderConfig {
	/** Discord webhook URL */
	webhookUrl: string
	/** Optional username to display (default: 'polym') */
	username?: string
	/** Optional avatar URL */
	avatarUrl?: string
}

/**
 * Telegram-specific configuration.
 */
export interface TelegramProviderConfig extends AlertProviderConfig {
	/** Telegram bot token */
	botToken: string
	/** Chat ID to send messages to */
	chatId: string
	/** Parse mode for message formatting (default: 'HTML') */
	parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
}

/**
 * Abstract interface for alert providers.
 *
 * Implement this interface to add support for new notification services.
 */
export interface AlertProvider {
	/** Provider type identifier (e.g., 'discord', 'telegram') */
	readonly type: string

	/** Human-readable name for this provider instance */
	readonly name: string

	/**
	 * Send an alert message.
	 *
	 * @param message - The alert to send
	 * @returns Result indicating success or failure
	 */
	send(message: AlertMessage): Promise<AlertResult>

	/**
	 * Check if the provider is properly configured and reachable.
	 *
	 * @returns True if the provider can send messages
	 */
	isHealthy(): Promise<boolean>
}
