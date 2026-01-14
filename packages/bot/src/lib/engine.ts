import { setTimeout } from 'node:timers/promises'

import { connectMarketWebSocket, connectUserWebSocket } from '@polym/sdk'
import { log } from '@polym/utils/server'

import {
	CLEANUP_INTERVAL_MS,
	STATE_REFRESH_INTERVAL_MS,
	WS_CHECK_INTERVAL_MS,
	WS_RECONNECT_DELAY_MS,
} from '../constants'
import { handleMarketMessage, handleUserMessage } from './handlers'
import { cleanStalePendingTrades, createEngineState, findMarketByToken } from './state'

import type { PolymarketClient } from '@polym/sdk'
import type { EngineState, RunBotOptions } from '../types'

/**
 * Run the trading bot.
 *
 * This is the main entry point that:
 * 1. Initializes state from config
 * 2. Fetches initial positions and orders
 * 3. Connects to websockets
 * 4. Runs the trading loop
 *
 * @param options - Bot run options
 */
export async function runBot(options: RunBotOptions): Promise<void> {
	const { config, client, dryRun = false } = options

	log.info(`Starting bot with ${config.markets.length} markets...`)

	if (dryRun) {
		log.warn('DRY RUN MODE - no real orders will be placed')
	}

	const state = createEngineState(config.markets)
	state.isRunning = true

	const credentials = client.getCredentials()
	await initializeState(state, client)

	const cleanupInterval = setInterval(() => {
		cleanStalePendingTrades(state)
	}, CLEANUP_INTERVAL_MS)

	const refreshInterval = setInterval(() => {
		void refreshState(state, client)
	}, STATE_REFRESH_INTERVAL_MS)

	try {
		await runWebSocketLoop(state, client, credentials)
	} finally {
		state.isRunning = false
		clearInterval(cleanupInterval)
		clearInterval(refreshInterval)
	}
}

/**
 * Initialize state with current positions and orders.
 *
 * @param state - Engine state
 * @param client - Polymarket client
 */
async function initializeState(state: EngineState, client: PolymarketClient): Promise<void> {
	log.info('Fetching initial positions and orders...')

	try {
		const positions = await client.getAllPositions()
		const orders = await client.getOrders()

		for (const pos of positions) {
			const market = findMarketByToken(state, pos.tokenId)
			if (!market) continue

			if (market.config.token1 === pos.tokenId) {
				market.position1 = pos
			} else {
				market.position2 = pos
			}
		}

		for (const order of orders) {
			const market = findMarketByToken(state, order.tokenId)
			if (!market) continue

			if (market.config.token1 === order.tokenId) {
				market.orders1.push(order)
			} else {
				market.orders2.push(order)
			}
		}

		log.step(`Loaded ${positions.length} positions and ${orders.length} orders`)
	} catch (error) {
		log.error(
			`Failed to initialize state: ${error instanceof Error ? error.message : String(error)}`,
		)
		throw error
	}
}

/**
 * Refresh state periodically.
 *
 * @param state - Engine state
 * @param client - Polymarket client
 */
async function refreshState(state: EngineState, client: PolymarketClient): Promise<void> {
	try {
		const positions = await client.getAllPositions()
		const orders = await client.getOrders()

		for (const market of state.markets.values()) {
			market.orders1 = []
			market.orders2 = []
		}

		for (const pos of positions) {
			const market = findMarketByToken(state, pos.tokenId)

			if (!market) {
				continue
			}

			if (market.config.token1 === pos.tokenId) {
				market.position1 = pos
			} else {
				market.position2 = pos
			}
		}

		for (const order of orders) {
			const market = findMarketByToken(state, order.tokenId)

			if (!market) {
				continue
			}

			if (market.config.token1 === order.tokenId) {
				market.orders1.push(order)
			} else {
				market.orders2.push(order)
			}
		}
	} catch (error) {
		log.error(
			`Failed to refresh state: ${error instanceof Error ? error.message : String(error)}`,
		)
	}
}

/**
 * Run websocket connections with auto-reconnect.
 *
 * @param state - Engine state
 * @param client - Polymarket client
 * @param credentials - API credentials
 */
async function runWebSocketLoop(
	state: EngineState,
	client: PolymarketClient,
	credentials: { apiKey: string; apiSecret: string; apiPassphrase: string },
): Promise<void> {
	while (state.isRunning) {
		try {
			log.info('Connecting to websockets...')

			const marketWs = connectMarketWebSocket({
				tokenIds: state.subscribedTokens,
				onMessage: msg => handleMarketMessage(state, client, msg),
				onError: err => log.error(`Market WS error: ${String(err)}`),
				onClose: () => log.info('Market WS closed'),
			})

			const userWs = connectUserWebSocket({
				credentials,
				onMessage: msg => handleUserMessage(state, msg),
				onError: err => log.error(`User WS error: ${String(err)}`),
				onClose: () => log.info('User WS closed'),
			})

			log.step('Connected to websockets')

			await new Promise<void>(resolve => {
				const checkInterval = setInterval(() => {
					if (!marketWs.isOpen() || !userWs.isOpen()) {
						clearInterval(checkInterval)
						resolve()
					}
				}, WS_CHECK_INTERVAL_MS)
			})

			marketWs.close()
			userWs.close()

			log.warn(`Websocket disconnected, reconnecting in ${WS_RECONNECT_DELAY_MS / 1000}s...`)

			await setTimeout(WS_RECONNECT_DELAY_MS)
		} catch (error) {
			log.error(
				`Websocket loop error: ${error instanceof Error ? error.message : String(error)}`,
			)
			await setTimeout(WS_RECONNECT_DELAY_MS)
		}
	}
}
