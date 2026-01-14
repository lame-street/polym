import { DATA_API_HOST } from '../../constants'
import { decodePositions } from '../../types/codecs/data'
import { positionsWireSchema, valueWireSchema } from '../../types/wire/data-rest'

import type { Position } from '../../types/domain/positions'
import type { WalletAddress } from '../../types/ids'

/**
 * Client for the Data API (REST).
 *
 * Provides access to user positions, activity, and history.
 * Most endpoints are public (only require wallet address, not auth).
 *
 * @see https://docs.polymarket.com/developers/data-api
 */
export class DataClient {
	private readonly host: string

	/**
	 * Create a new Data API client.
	 *
	 * @param options - Optional configuration
	 */
	constructor(options?: { host?: string }) {
		this.host = options?.host ?? DATA_API_HOST
	}

	/**
	 * Get all positions for a wallet.
	 *
	 * @param walletAddress - The wallet address to query
	 * @returns An array of positions
	 */
	async getPositions(walletAddress: WalletAddress): Promise<Position[]> {
		const url = new URL('/positions', this.host)
		url.searchParams.set('user', walletAddress)

		const res = await fetch(url)

		if (!res.ok) {
			throw new Error(`Failed to fetch positions (${res.status})`)
		}

		const wire = positionsWireSchema.parse(await res.json())
		return decodePositions(wire)
	}

	/**
	 * Get total position value for a wallet.
	 *
	 * @param walletAddress - The wallet address to query
	 * @returns The total position value in dollars
	 */
	async getPositionValue(walletAddress: WalletAddress): Promise<number> {
		const url = new URL('/value', this.host)
		url.searchParams.set('user', walletAddress)

		const res = await fetch(url)

		if (!res.ok) {
			throw new Error(`Failed to fetch position value (${res.status})`)
		}

		const wire = valueWireSchema.parse(await res.json())
		return wire[0]?.value ?? 0
	}
}
