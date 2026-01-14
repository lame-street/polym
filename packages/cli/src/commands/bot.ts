import * as p from '@clack/prompts'

import { runBot } from '@polym/bot'
import { loadConfig, requireEnvs } from '@polym/config'
import { PolymarketClient } from '@polym/sdk'
import { log } from '@polym/utils/server'

import { handleError, intro, outro } from '../lib'

/**
 * Options for the bot command.
 */
interface BotCommandOptions {
	dryRun: boolean
	configPath: string
}

/**
 * Run the trading bot.
 *
 * @param options - Command options
 */
export async function runBotCommand(options: BotCommandOptions): Promise<void> {
	intro('Polymarket Trading Bot')

	if (options.dryRun) {
		log.warn('Running in DRY RUN mode — no real orders will be placed')
	}

	let config

	try {
		config = await loadConfig(options.configPath)
	} catch (error) {
		handleError(error)
	}

	log.step(`Loaded ${config.markets.length} market(s)`)

	let env

	try {
		env = requireEnvs(['PK', 'BROWSER_ADDRESS'])
	} catch (error) {
		handleError(error)
	}

	const client = new PolymarketClient({
		privateKey: env.PK,
		walletAddress: env.BROWSER_ADDRESS,
	})

	const s = p.spinner()

	s.start('Deriving API credentials')

	try {
		const credentials = await client.deriveCredentials()
		client.setCredentials(credentials)
		s.stop('Credentials ready')
	} catch (error) {
		s.stop('Failed', 1)
		handleError(error)
	}

	log.info('Starting trading loop...')

	await runBot({
		config,
		client,
		dryRun: options.dryRun,
	})

	outro.info('Bot stopped')
}
