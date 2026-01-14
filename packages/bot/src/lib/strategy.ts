import { log } from '@polym/utils/server'

import {
	MAX_PRICE,
	MIN_ORDER_SIZE_BUMP_RATIO,
	MIN_PRICE,
	PRICE_DIFF_THRESHOLD,
	SIZE_DIFF_THRESHOLD,
	THIN_BOOK_SIZE_MULTIPLIER,
} from '../constants'
import { addPendingTrade, isRiskOff } from './state'

import type { MarketConfig } from '@polym/config'
import type { ConditionId, Order, OrderBook, PolymarketClient, Position, TokenId } from '@polym/sdk'
import type { EngineState, MarketState, PendingTrade } from '../types'

/**
 * Minimal market-making strategy (warproxxx/poly-maker inspired).
 *
 * - Pick quote prices close to the top-of-book, adjusted by tick size
 * - Size quotes using (tradeSize, maxSize) and do **no shorting**
 * - Only cancel/repost when the delta is material (price/size thresholds)
 * - Use a small price guardrail (MIN_PRICE/MAX_PRICE) to avoid extreme quotes
 *
 * Important design notes:
 * - We currently use the "cancel all then re-post" approach (per your choice).
 *   This is simple but can be churny; we mitigate churn via `shouldRequote()`.
 * - `pendingTrades` is used as a coarse re-entrancy guard: if we just submitted
 *   an action for a token, we avoid issuing another one until it clears/stales.
 */

/**
 * Get best bid price and size from an order book.
 *
 * We try to find the highest-priced bid that has at least `minSize` liquidity.
 * If no bid meets the minimum, we fall back to the top-of-book bid (if present).
 *
 * This is a small adaptation of poly-maker's "find best price with size" logic.
 * The key intention is: avoid quoting off a dusty top-of-book when the book is thin.
 *
 * @param book - The order book
 * @param minSize - Minimum size to consider for "best" price
 * @returns Best bid price/size or null if none available
 */
function getBestBid(book: OrderBook, minSize: number): { price: number; size: number } | null {
	/**
	 * Bids are sorted descending by price (highest first).
	 */
	for (const entry of book.bids) {
		if (entry.size >= minSize) {
			return { price: entry.price, size: entry.size }
		}
	}
	/**
	 * Fall back to top of book if no entry meets `minSize`.
	 */
	return book.bids[0] ?? null
}

/**
 * Get best ask price and size from an order book.
 *
 * We try to find the lowest-priced ask that has at least `minSize` liquidity.
 * If no ask meets the minimum, we fall back to the top-of-book ask (if present).
 *
 * This mirrors the intent of poly-maker's `find_best_price_with_size()` but in a
 * simplified form over our array-based `OrderBook`.
 *
 * @param book - The order book
 * @param minSize - Minimum size to consider for "best" price
 * @returns Best ask price/size or null if none available
 */
function getBestAsk(book: OrderBook, minSize: number): { price: number; size: number } | null {
	/**
	 * Asks are sorted ascending by price (lowest first).
	 */
	for (const entry of book.asks) {
		if (entry.size >= minSize) {
			return { price: entry.price, size: entry.size }
		}
	}
	/**
	 * Fall back to top of book if no entry meets `minSize`.
	 */
	return book.asks[0] ?? null
}

/**
 * Calculate quote prices based on best bid/ask and tick size.
 * Mirrors poly-maker's `get_order_prices()` logic.
 *
 * Strategy:
 * - Start by improving the best bid by +tick and improving the best ask by -tick.
 * - If top-of-book size is thin (relative to `minSize`), do not improve; just join.
 * - Never cross the spread (avoid taking liquidity inadvertently).
 * - If our computed bid equals our computed ask, widen back out to the raw top-of-book.
 *
 * The goal is stable, non-crossing quotes that move only when the market meaningfully moves.
 *
 * @param bestBid - Best bid price
 * @param bestBidSize - Best bid size
 * @param topBid - Top of book bid (regardless of size)
 * @param bestAsk - Best ask price
 * @param bestAskSize - Best ask size
 * @param topAsk - Top of book ask (regardless of size)
 * @param config - Market config with tickSize, minSize
 * @returns Calculated bid and ask prices
 */
function calculateQuotePrices(
	bestBid: number,
	bestBidSize: number,
	topBid: number,
	bestAsk: number,
	bestAskSize: number,
	topAsk: number,
	config: MarketConfig,
): { bidPrice: number; askPrice: number } {
	let bidPrice = bestBid + config.tickSize
	let askPrice = bestAsk - config.tickSize

	/**
	 * If the best price level has thin liquidity, do **not** try to step ahead by one tick.
	 *
	 * Why:
	 * - When size at the best level is tiny, improving by one tick often just places us
	 *   at the very front of the queue, becoming the easiest target for informed flow.
	 * - Joining the best level is more conservative: we still quote near the market,
	 *   but we avoid “overreacting” to a potentially noisy top-of-book.
	 *
	 * This is a simplified analogue of poly-maker's logic that checks whether the
	 * best level has enough size to justify improving it.
	 */
	if (bestBidSize < config.minSize * THIN_BOOK_SIZE_MULTIPLIER) {
		bidPrice = bestBid
	}

	if (bestAskSize < config.minSize * THIN_BOOK_SIZE_MULTIPLIER) {
		askPrice = bestAsk
	}

	/**
	 * Don't cross the book (i.e., don't post a bid >= current ask, or an ask <= current bid).
	 *
	 * Why:
	 * - A crossing quote is effectively a marketable order: it will likely execute
	 *   immediately as a taker, paying the spread and potentially getting worse fills.
	 * - With tick-size adjustments, it's easy to accidentally cross on tight spreads.
	 *
	 * When we detect a cross, we revert to the raw top-of-book prices as the safest,
	 * deterministic non-crossing baseline.
	 */
	if (bidPrice >= topAsk) {
		bidPrice = topBid
	}

	if (askPrice <= topBid) {
		askPrice = topAsk
	}

	/**
	 * If our computed bid and ask end up equal, widen back out to the raw
	 * top-of-book prices.
	 *
	 * Why this happens:
	 * - We start by improving: `bid = bestBid + tick`, `ask = bestAsk - tick`.
	 * - If the spread is very tight (or tick is large relative to the spread),
	 *   those two operations can “collapse” the quote levels onto the same price.
	 * - Our earlier guardrails can also snap us back to `topBid` / `topAsk` in ways
	 *   that make them equal in edge cases (thin book, crossing prevention).
	 *
	 * Why we widen:
	 * - A bid==ask quote is ambiguous and unstable: it can turn into a crossing quote
	 *   after rounding, book updates, or when we apply the other crossing checks.
	 * - Using the raw `topBid`/`topAsk` gives us a deterministic, non-crossing baseline
	 *   that reflects current market reality, without accidentally behaving like a taker.
	 */
	if (bidPrice === askPrice) {
		bidPrice = topBid
		askPrice = topAsk
	}

	return { bidPrice, askPrice }
}

/**
 * Calculate buy/sell amounts based on position and config.
 * Mirrors poly-maker's `get_buy_sell_amount()` logic.
 *
 * Core behavior:
 * - Build position in `tradeSize` chunks until reaching `maxSize`
 * - **No shorting**: only SELL when we already have inventory
 * - Once at `maxSize`, bias to selling (reduce inventory)
 *
 * Note: This is intentionally minimal. More sophisticated risk logic
 * (volatility checks, stop-loss, etc.) can be layered on later.
 *
 * @param position - Current position size
 * @param config - Market config with tradeSize, maxSize, minSize
 * @returns Buy and sell amounts
 */
function calculateQuoteSizes(
	position: number,
	config: MarketConfig,
): { buyAmount: number; sellAmount: number } {
	let buyAmount = 0
	let sellAmount = 0

	if (position < config.maxSize) {
		/**
		 * Continue building inventory in `tradeSize` chunks until we hit `maxSize`.
		 *
		 * Why:
		 * - Chunking avoids slamming into size limits in a single quote.
		 * - It also reduces the amount of capital we expose at once if the market shifts.
		 */
		const remainingToMax = config.maxSize - position
		buyAmount = Math.min(config.tradeSize, remainingToMax)

		/**
		 * Only sell if we already have inventory (no shorting).
		 *
		 * Why:
		 * - Many minimal market makers only want to provide liquidity using owned inventory,
		 *   not open short positions.
		 * - This keeps the bot behavior closer to poly-maker's default approach and avoids
		 *   unexpected exposure from SELL fills when we have no position.
		 */
		if (position >= config.tradeSize) {
			sellAmount = Math.min(position, config.tradeSize)
		}
	} else {
		/**
		 * If we've reached our max inventory, bias toward selling.
		 *
		 * Why:
		 * - `maxSize` is the per-outcome risk cap. Once we hit it, further buys should be
		 *   avoided and we should work inventory down to reduce risk.
		 */
		sellAmount = Math.min(position, config.tradeSize)
	}

	/**
	 * Enforce minimum order size.
	 *
	 * Why:
	 * - Exchanges often reject orders below a minimum size (`minSize`).
	 * - The 0.7x threshold is a pragmatic smoothing rule: if we're “close enough” to
	 *   minSize, we bump up so we don't oscillate between 0 and a rejected tiny order.
	 */
	if (buyAmount > MIN_ORDER_SIZE_BUMP_RATIO * config.minSize && buyAmount < config.minSize) {
		buyAmount = config.minSize
	}

	if (sellAmount > MIN_ORDER_SIZE_BUMP_RATIO * config.minSize && sellAmount < config.minSize) {
		sellAmount = config.minSize
	}

	return { buyAmount, sellAmount }
}

/**
 * Check if our existing order differs materially from desired quote.
 *
 * We want to avoid churn. In poly-maker, `send_buy_order()` and `send_sell_order()`
 * cancel and re-post only when the price/size changed "enough". We do the same here.
 *
 * Definitions:
 * - Price diff uses absolute difference (e.g. 0.005 ~ half a cent).
 * - Size diff uses percent of desired size (e.g. 10%).
 * - We compare against remaining size (`originalSize - sizeMatched`) because an
 *   order that is partially filled should generally be topped back up.
 *
 * @param existingOrders - Our existing orders for this token/side
 * @param desiredPrice - Desired quote price
 * @param desiredSize - Desired quote size
 * @param side - Order side to check
 * @returns True if we should cancel and re-quote
 */
function shouldRequote(
	existingOrders: Order[],
	desiredPrice: number,
	desiredSize: number,
	side: 'BUY' | 'SELL',
): boolean {
	const existing = existingOrders.find(o => o.side === side)

	if (!existing) {
		/**
		 * No existing order for this side.
		 *
		 * Why this implies re-quoting:
		 * - If our desired size is > 0, we need to create a new order to actually quote.
		 */
		return desiredSize > 0
	}

	if (desiredSize === 0) {
		/**
		 * We don't want to quote this side anymore.
		 *
		 * Why this implies re-quoting:
		 * - If an order exists but desired size is 0, we should cancel it (via the
		 *   cancel-all path for now) so we're not providing unintended liquidity.
		 */
		return true
	}

	const priceDiff = Math.abs(existing.price - desiredPrice)
	const remainingSize = existing.originalSize - existing.sizeMatched
	const sizeDiff = Math.abs(remainingSize - desiredSize)

	return priceDiff > PRICE_DIFF_THRESHOLD || sizeDiff > desiredSize * SIZE_DIFF_THRESHOLD
}

/**
 * Evaluate and execute quoting strategy for a single token.
 *
 * This is the core "quote maintenance" unit:
 * - Derive best bid/ask from the current order book
 * - Compute desired quote price/size (tick-sized, inventory-aware)
 * - If the quote is materially different than our current order, cancel and repost
 *
 * Important: We intentionally use `cancelAllForMarket()` (market-level cancel).
 * This keeps the bot simple, but it means one token's requote can clear the other
 * token's orders too. That’s OK for now, and the thresholds keep it from thrashing.
 *
 * @param tokenId - Token to quote
 * @param orderBook - Current order book
 * @param position - Current position
 * @param orders - Our existing orders
 * @param config - Market config
 * @param client - Polymarket client
 * @param pendingTrades - Pending trades map
 * @param state - Engine state for adding pending trades
 */
async function quoteToken(
	tokenId: string,
	orderBook: OrderBook,
	position: Position | null,
	orders: Order[],
	config: MarketConfig,
	client: PolymarketClient,
	pendingTrades: Map<string, PendingTrade>,
	state: EngineState,
): Promise<void> {
	const positionSize = position?.size ?? 0

	/**
	 * Identify price levels to anchor our quotes.
	 *
	 * We use two concepts:
	 * - `bestBid/bestAsk`: best levels that meet our min size filter (preferred anchor).
	 * - `topBid/topAsk`: literal top-of-book (used as a fallback + for crossing checks).
	 *
	 * This is a simplified version of poly-maker's “best price with size” logic.
	 */
	const bestBid = getBestBid(orderBook, config.minSize)
	const bestAsk = getBestAsk(orderBook, config.minSize)
	const [topBid] = orderBook.bids
	const [topAsk] = orderBook.asks

	if (!bestBid || !bestAsk || !topBid || !topAsk) {
		/**
		 * Not enough liquidity to quote safely.
		 * In this case we simply do nothing rather than guessing prices.
		 */
		return
	}

	/**
	 * Compute desired quote prices.
	 *
	 * We generally try to be one tick better than the best levels, unless the book is thin
	 * or we'd end up crossing. This keeps quotes competitive without turning us into a taker.
	 */
	const { bidPrice, askPrice } = calculateQuotePrices(
		bestBid.price,
		bestBid.size,
		topBid.price,
		bestAsk.price,
		bestAsk.size,
		topAsk.price,
		config,
	)

	/**
	 * Compute desired quote sizes (inventory-aware).
	 *
	 * This is where we enforce:
	 * - incremental inventory building (tradeSize)
	 * - exposure caps (maxSize)
	 * - no shorting (SELL size becomes 0 when we lack inventory)
	 */
	const { buyAmount, sellAmount } = calculateQuoteSizes(positionSize, config)

	/**
	 * Guardrail: avoid quoting too close to 0 or 1, which can concentrate risk
	 * and generally produces undesirable fills for a minimal market maker.
	 *
	 * Why:
	 * - Quotes near 0/1 are extremely asymmetric: a small move can cause large % PnL swings.
	 * - Minimal market makers tend to be “most comfortable” providing liquidity in the
	 *   central band where both sides can trade and inventory can mean-revert.
	 */
	const canBuy = bidPrice >= MIN_PRICE && bidPrice < MAX_PRICE
	const canSell = askPrice > MIN_PRICE && askPrice <= MAX_PRICE

	/**
	 * Only cancel/re-post if the quote moved materially.
	 *
	 * Why:
	 * - Cancel/repost churn is expensive in practice (rate limits, unnecessary WS noise,
	 *   and it can momentarily remove us from the book).
	 * - We aim for “sticky” quotes: small market microstructure changes should not cause
	 *   constant cancellations.
	 */
	const needBuyRequote = canBuy && shouldRequote(orders, bidPrice, buyAmount, 'BUY')
	const needSellRequote = canSell && shouldRequote(orders, askPrice, sellAmount, 'SELL')

	if (!needBuyRequote && !needSellRequote) {
		/**
		 * Quotes are "close enough" to desired state.
		 *
		 * Returning here is important: the market may update very frequently and we only
		 * want to act when it’s meaningful. This keeps behavior stable and predictable.
		 */
		return
	}

	/**
	 * Cancel all orders for this market and re-quote.
	 *
	 * Why we cancel-all:
	 * - Simplicity. We currently don't maintain a precise mapping from our desired quote
	 *   adjustments to specific order IDs (per token / per side).
	 *
	 * What this means:
	 * - Requoting one token can cancel the other token's orders too (same conditionId).
	 * - The `shouldRequote()` thresholds are the main defense against thrashing.
	 */
	try {
		/**
		 * Mark the token as pending before we submit any actions, so we don't issue
		 * duplicate cancels/orders while waiting for user WS events / refresh loop.
		 *
		 * Practical reason:
		 * - WebSocket + REST calls are asynchronous; without a pending guard we can spam
		 *   cancels and creates on back-to-back book updates.
		 */
		addPendingTrade(state, tokenId, needBuyRequote ? 'BUY' : 'SELL')

		await client.cancelAllForMarket(config.conditionId as ConditionId)

		/**
		 * Place buy order if needed.
		 *
		 * - `canBuy` enforces the price band guardrail.
		 * - `buyAmount > 0` ensures we actually want to quote on this side right now.
		 */
		if (canBuy && buyAmount > 0) {
			log.info(`Placing BUY ${buyAmount} @ ${bidPrice} for ${config.question}`)

			await client.createOrder(tokenId as TokenId, 'BUY', bidPrice, buyAmount, {
				negRisk: config.negRisk,
			})
		}

		/**
		 * Place sell order if needed.
		 *
		 * Note: In no-shorting mode, `sellAmount` will be 0 until we have inventory.
		 */
		if (canSell && sellAmount > 0) {
			log.info(`Placing SELL ${sellAmount} @ ${askPrice} for ${config.question}`)
			await client.createOrder(tokenId as TokenId, 'SELL', askPrice, sellAmount, {
				negRisk: config.negRisk,
			})
		}
	} catch (error) {
		log.error(
			`Failed to quote ${config.question}: ${error instanceof Error ? error.message : String(error)}`,
		)
	}
}

/**
 * Evaluates the trading strategy for a given market and executes trades if necessary.
 *
 * This is called from `handleMarketMessage()` after we update the order book.
 *
 * Important invariants:
 * - We require both outcome books before we do any work. (If one side is missing,
 *   our pricing logic is incomplete.)
 * - We avoid overlapping actions by checking `pendingTrades` for both tokens.
 * - We respect a market-level risk-off window if set.
 *
 * @param market - The current state of the market
 * @param client - The Polymarket client for executing trades
 * @param pendingTrades - Map of currently pending trades
 * @param state - Engine state for adding pending trades
 */
export async function evaluateStrategy(
	market: MarketState,
	client: PolymarketClient,
	pendingTrades: Map<string, PendingTrade>,
	state: EngineState,
): Promise<void> {
	const { config, orderBook1, orderBook2 } = market

	/**
	 * Skip if we don't have both order books.
	 *
	 * Why:
	 * - This strategy relies on having a current view of both outcomes. If one side
	 *   is missing, we can't reliably decide whether our quotes are reasonable.
	 */
	if (!orderBook1 || !orderBook2) return

	/**
	 * Skip if we have pending trades for either token.
	 *
	 * Why:
	 * - Pending indicates we recently acted. Skipping prevents rapid-fire cancels/creates
	 *   while the system is still converging (WS events in-flight, refresh loop pending).
	 */
	if (pendingTrades.has(config.token1) || pendingTrades.has(config.token2)) return

	/**
	 * Skip if in risk-off period.
	 *
	 * Why:
	 * - Risk-off is a manual/automatic “cooldown” window where we intentionally do not
	 *   add/adjust exposure. It’s a safety valve for unstable conditions.
	 */
	if (isRiskOff(market)) return

	/**
	 * Quote token1.
	 *
	 * This will potentially cancel/repost market orders (see `quoteToken` docblock).
	 */
	await quoteToken(
		config.token1,
		orderBook1,
		market.position1,
		market.orders1,
		config,
		client,
		pendingTrades,
		state,
	)

	/**
	 * Quote token2.
	 *
	 * This is symmetrical to token1; the only difference is which book/position/orders we use.
	 */
	await quoteToken(
		config.token2,
		orderBook2,
		market.position2,
		market.orders2,
		config,
		client,
		pendingTrades,
		state,
	)
}
