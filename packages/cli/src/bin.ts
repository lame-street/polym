#!/usr/bin/env node
import { Command } from 'commander'

import { runAccountStats } from './commands/account'
import { runBotCommand } from './commands/bot'
import { runMarketsSnapshot } from './commands/markets'
import { handleError } from './lib'

const program = new Command()

program.name('polym').description('Polymarket trading bot').version('0.0.0')

program
	.command('bot')
	.description('Run the trading bot')
	.option('-d, --dry-run', "Don't place real orders")
	.option('-c, --config <path>', 'Path to config file', 'config/bot.config.json')
	.action(async (options: { dryRun?: boolean; config: string }) => {
		try {
			await runBotCommand({
				dryRun: options.dryRun ?? false,
				configPath: options.config,
			})
		} catch (error) {
			handleError(error)
		}
	})

program
	.command('markets')
	.description('Market data commands')
	.command('snapshot')
	.description('Fetch and display market data')
	.action(() => {
		try {
			runMarketsSnapshot()
		} catch (error) {
			handleError(error)
		}
	})

program
	.command('account')
	.description('Account commands')
	.command('stats')
	.description('Show account statistics')
	.action(async () => {
		try {
			await runAccountStats()
		} catch (error) {
			handleError(error)
		}
	})

program.parse()
