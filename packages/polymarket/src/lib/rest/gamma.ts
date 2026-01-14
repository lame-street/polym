import { GAMMA_API_HOST } from '../../constants'
import {
	decodeGammaEvent,
	decodeGammaEvents,
	decodeGammaMarket,
	decodeGammaMarkets,
} from '../../types/codecs/gamma'
import {
	gammaEventsWireSchema,
	gammaEventWireSchema,
	gammaMarketsWireSchema,
	gammaMarketWireSchema,
} from '../../types/wire/gamma'

import type { GammaEvent, GammaMarket, GammaMarketSortField } from '../../types/domain/markets'

/**
 * Client for the Gamma API (REST).
 *
 * Provides access to market discovery, metadata, and event information.
 * No API credentials required.
 *
 * @see https://docs.polymarket.com/developers/gamma-markets-api
 */
export class GammaClient {
	private readonly host: string

	/**
	 * Create a new Gamma client.
	 *
	 * @param options - Optional configuration
	 */
	constructor(options?: { host?: string }) {
		this.host = options?.host ?? GAMMA_API_HOST
	}

	/**
	 * Get a list of events.
	 *
	 * By default, returns only active, non-closed events.
	 *
	 * @param options - Query options (defaults: active=true, closed=false)
	 * @returns An array of events
	 */
	async getEvents(options?: {
		limit?: number
		offset?: number
		active?: boolean
		closed?: boolean
	}): Promise<GammaEvent[]> {
		const active = options?.active ?? true
		const closed = options?.closed ?? false

		const url = new URL('/events', this.host)
		if (options?.limit) url.searchParams.set('limit', String(options.limit))
		if (options?.offset) url.searchParams.set('offset', String(options.offset))
		url.searchParams.set('active', String(active))
		url.searchParams.set('closed', String(closed))

		const res = await fetch(url)
		if (!res.ok) {
			throw new Error(`Failed to fetch events (${res.status})`)
		}

		const wire = gammaEventsWireSchema.parse(await res.json())
		return decodeGammaEvents(wire)
	}

	/**
	 * Get a specific event by ID.
	 *
	 * @param eventId - Event ID
	 * @returns The event details
	 */
	async getEvent(eventId: string): Promise<GammaEvent> {
		const url = new URL(`/events/${eventId}`, this.host)

		const res = await fetch(url)

		if (!res.ok) {
			throw new Error(`Failed to fetch event (${res.status})`)
		}

		const wire = gammaEventWireSchema.parse(await res.json())
		return decodeGammaEvent(wire)
	}

	/**
	 * Get a list of markets.
	 *
	 * By default, returns only active, non-closed markets.
	 * When `order` is specified, defaults to descending (highest first).
	 *
	 * @param options - Query options (defaults: active=true, closed=false, ascending=false)
	 * @returns An array of markets with parsed fields
	 */
	async getMarkets(options?: {
		limit?: number
		offset?: number
		active?: boolean
		closed?: boolean
		order?: GammaMarketSortField
		ascending?: boolean
	}): Promise<GammaMarket[]> {
		const active = options?.active ?? true
		const closed = options?.closed ?? false

		const url = new URL('/markets', this.host)

		url.searchParams.set('active', String(active))
		url.searchParams.set('closed', String(closed))

		if (options?.limit) url.searchParams.set('limit', String(options.limit))
		if (options?.offset) url.searchParams.set('offset', String(options.offset))
		if (options?.order) {
			const sortField = options.order === 'volume' ? 'volumeNum' : options.order
			url.searchParams.set('order', sortField)
			url.searchParams.set('ascending', String(options.ascending ?? false))
		}

		const res = await fetch(url)

		if (!res.ok) {
			throw new Error(`Failed to fetch markets (${res.status})`)
		}

		const wire = gammaMarketsWireSchema.parse(await res.json())
		return decodeGammaMarkets(wire)
	}

	/**
	 * Get a specific market by ID.
	 *
	 * Note: Uses the numeric `id` field, not `conditionId`.
	 *
	 * @param marketId - Market ID (numeric)
	 * @returns The market details with parsed fields
	 */
	async getMarket(marketId: string): Promise<GammaMarket> {
		const url = new URL(`/markets/${marketId}`, this.host)

		const res = await fetch(url)

		if (!res.ok) {
			throw new Error(`Failed to fetch market (${res.status})`)
		}

		const wire = gammaMarketWireSchema.parse(await res.json())
		return decodeGammaMarket(wire)
	}
}
