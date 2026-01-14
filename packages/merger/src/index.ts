/**
 * Position merge operations for Polymarket.
 *
 * This package handles merging opposing positions (YES + NO) to recover collateral.
 * When you hold both outcomes in a market, merging them returns your USDC.
 *
 * Implementation deferred - this is a stub defining the interface.
 *
 * @packageDocumentation
 */

/**
 * Options for merging positions.
 */
export interface MergeOptions {
	/** Amount to merge (raw token units) */
	amount: number
	/** Market condition ID */
	conditionId: string
	/** Whether this is a negative risk market */
	negRisk: boolean
}

/**
 * Result of a merge operation.
 */
export interface MergeResult {
	success: boolean
	txHash?: string
	error?: string
}

/**
 * Merge positions to recover collateral.
 *
 * @param _options - Merge options
 */
export function mergePositions(_options: MergeOptions): Promise<MergeResult> {
	// TODO: Implement using viem or wrap the existing JS implementation
	throw new Error('Not implemented: mergePositions')
}
