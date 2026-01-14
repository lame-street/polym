/**
 * Bot internal constants.
 */

/** Interval for periodic state refresh (positions, orders) */
export const STATE_REFRESH_INTERVAL_MS = 30_000

/** Interval for cleaning up stale pending trades */
export const CLEANUP_INTERVAL_MS = 5_000

/** Time after which a pending trade is considered stale */
export const PENDING_TRADE_TIMEOUT_MS = 15_000

/** Delay before attempting to reconnect a websocket */
export const WS_RECONNECT_DELAY_MS = 5_000

/** Interval for checking if websocket connection is still open */
export const WS_CHECK_INTERVAL_MS = 1_000

/**
 * If a best bid/ask level has less than `minSize * THIN_BOOK_SIZE_MULTIPLIER` liquidity,
 * we treat it as thin and prefer joining (not improving) that level.
 */
export const THIN_BOOK_SIZE_MULTIPLIER = 1.5

/**
 * If computed order size is between `(minSize * MIN_ORDER_SIZE_BUMP_RATIO)` and `minSize`,
 * bump it up to `minSize` to avoid oscillating into rejected tiny orders.
 */
export const MIN_ORDER_SIZE_BUMP_RATIO = 0.7

/** Minimum price diff before we cancel and re-quote */
export const PRICE_DIFF_THRESHOLD = 0.005

/** Minimum size diff (as %) before we cancel and re-quote */
export const SIZE_DIFF_THRESHOLD = 0.1

/** Minimum acceptable price (avoid extreme positions) */
export const MIN_PRICE = 0.1

/** Maximum acceptable price (avoid extreme positions) */
export const MAX_PRICE = 0.9
