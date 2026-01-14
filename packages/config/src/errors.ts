/**
 * Error thrown when configuration loading fails.
 */
export class ConfigError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ConfigError'
	}
}

/**
 * Error thrown when one or more required environment variables are missing.
 */
export class EnvError extends Error {
	public readonly varNames: string[]

	constructor(varNames: string | string[]) {
		const names = Array.isArray(varNames) ? varNames : [varNames]
		const label = names.length > 1 ? 'variables' : 'variable'
		super(`Missing required environment ${label}: ${names.join(', ')}`)
		this.name = 'EnvError'
		this.varNames = names
	}
}
