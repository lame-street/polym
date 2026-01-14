import { loadConfig as c12Load } from 'c12'

import { ConfigError, EnvError } from './errors'

import type { BotConfig } from './types'

/**
 * Load bot configuration using c12.
 *
 * Searches for `bot.config.{ts,js,json,yaml,...}` in the config directory.
 * Automatically loads `.env` files and supports environment-specific overrides
 * via `$production`, `$development`, etc.
 *
 * @param configPath - Optional explicit config file path
 * @returns Parsed bot configuration
 * @throws ConfigError if config file doesn't exist or is invalid
 */
export async function loadConfig(configPath?: string): Promise<BotConfig> {
	try {
		const { config } = await c12Load<BotConfig>({
			name: 'bot',
			cwd: configPath ? undefined : 'config',
			configFile: configPath,
			dotenv: true,
			configFileRequired: true,
		})

		if (!config.markets || !Array.isArray(config.markets)) {
			throw new ConfigError('Config must have a "markets" array')
		}

		if (!config.strategy || typeof config.strategy !== 'object') {
			throw new ConfigError('Config must have a "strategy" object')
		}

		return config
	} catch (error) {
		if (error instanceof ConfigError) throw error
		if (error instanceof Error) {
			throw new ConfigError(error.message)
		}
		throw new ConfigError('Unknown configuration error')
	}
}

/**
 * Ensure multiple environment variables are set.
 *
 * @param names - Array of environment variable names to check
 * @returns Record of variable names to their values
 * @throws EnvError if any variables are missing
 */
export function requireEnvs<T extends string>(names: T[]): Record<T, string> {
	const missing = names.filter(name => !process.env[name])

	if (missing.length > 0) {
		throw new EnvError(missing)
	}

	const result = {} as Record<T, string>

	for (const name of names) {
		const value = process.env[name]
		if (value === undefined) {
			throw new EnvError(name)
		}
		result[name] = value
	}

	return result
}

/**
 * Get required environment variable or throw.
 *
 * @param name - Environment variable name
 * @returns The environment variable value
 * @throws EnvError if the variable is not set
 */
export function requireEnv(name: string): string {
	return requireEnvs([name])[name] as string
}
