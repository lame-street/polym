/**
 * Data API codecs - wire to domain conversion.
 */

import { TokenId } from '../ids'

import type { Position } from '../domain/positions'
import type { PositionWire } from '../wire/data-rest'

/**
 * Decode a position wire to domain type.
 *
 * @param wire - Raw position from API
 * @returns Parsed position
 */
export function decodePosition(wire: PositionWire): Position {
	return {
		tokenId: TokenId(wire.asset),
		size: Number(wire.size),
		avgPrice: Number(wire.avgPrice),
	}
}

/**
 * Decode an array of position wires to domain types.
 *
 * @param wires - Array of raw positions from API
 * @returns Array of parsed positions
 */
export function decodePositions(wires: PositionWire[]): Position[] {
	return wires.map(decodePosition)
}
