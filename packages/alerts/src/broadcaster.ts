import type {
	AlertBroadcasterOptions,
	AlertMessage,
	AlertProvider,
	BroadcastProviderResult,
	BroadcastResult,
} from './types'

/**
 * Broadcasts alerts to multiple providers.
 *
 * @example
 * ```typescript
 * const broadcaster = new AlertBroadcaster([
 *   new DiscordProvider({ webhookUrl: '...' }),
 *   new TelegramProvider({ botToken: '...', chatId: '...' }),
 * ])
 *
 * const result = await broadcaster.send({
 *   title: 'Order Filled',
 *   body: 'Your order was filled',
 *   severity: 'success',
 * })
 *
 * console.log(`${result.successCount}/${result.results.length} succeeded`)
 * ```
 */
export class AlertBroadcaster {
	private readonly providers: AlertProvider[]
	private readonly options: Required<AlertBroadcasterOptions>

	constructor(providers: AlertProvider[], options: AlertBroadcasterOptions = {}) {
		this.providers = [...providers]
		this.options = {
			continueOnError: options.continueOnError ?? true,
			parallel: options.parallel ?? true,
		}
	}

	/**
	 * Get the number of registered providers.
	 *
	 * @returns Provider count
	 */
	get count(): number {
		return this.providers.length
	}

	/**
	 * Add a provider to the broadcaster.
	 *
	 * @param provider - Provider to add
	 */
	add(provider: AlertProvider): void {
		this.providers.push(provider)
	}

	/**
	 * Remove a provider by name.
	 *
	 * @param name - Provider name to remove
	 * @returns True if a provider was removed
	 */
	remove(name: string): boolean {
		const index = this.providers.findIndex(p => p.name === name)
		if (index === -1) return false
		this.providers.splice(index, 1)
		return true
	}

	/**
	 * Send an alert to all providers.
	 *
	 * @param message - Alert message to broadcast
	 * @returns Aggregated results from all providers
	 */
	async send(message: AlertMessage): Promise<BroadcastResult> {
		if (this.providers.length === 0) {
			return {
				allSucceeded: true,
				successCount: 0,
				failureCount: 0,
				results: [],
			}
		}

		const results: BroadcastProviderResult[] = this.options.parallel
			? await this.sendParallel(message)
			: await this.sendSequential(message)

		const successCount = results.filter(r => r.result.success).length
		const failureCount = results.length - successCount

		return {
			allSucceeded: failureCount === 0,
			successCount,
			failureCount,
			results,
		}
	}

	/**
	 * Check health of all providers.
	 *
	 * @returns Map of provider names to health status
	 */
	async healthCheck(): Promise<Map<string, boolean>> {
		const results = new Map<string, boolean>()

		await Promise.all(
			this.providers.map(async provider => {
				try {
					const healthy = await provider.isHealthy()
					results.set(provider.name, healthy)
				} catch {
					results.set(provider.name, false)
				}
			}),
		)

		return results
	}

	private sendParallel(message: AlertMessage): Promise<BroadcastProviderResult[]> {
		const promises = this.providers.map(async provider => {
			try {
				const result = await provider.send(message)
				return { provider: provider.name, type: provider.type, result }
			} catch (error) {
				return {
					provider: provider.name,
					type: provider.type,
					result: {
						success: false,
						error: error instanceof Error ? error.message : String(error),
					},
				}
			}
		})

		return Promise.all(promises)
	}

	private async sendSequential(message: AlertMessage): Promise<BroadcastProviderResult[]> {
		const results: BroadcastProviderResult[] = []

		for (const provider of this.providers) {
			try {
				const result = await provider.send(message)
				results.push({ provider: provider.name, type: provider.type, result })

				if (!result.success && !this.options.continueOnError) {
					break
				}
			} catch (error) {
				results.push({
					provider: provider.name,
					type: provider.type,
					result: {
						success: false,
						error: error instanceof Error ? error.message : String(error),
					},
				})

				if (!this.options.continueOnError) {
					break
				}
			}
		}

		return results
	}
}
