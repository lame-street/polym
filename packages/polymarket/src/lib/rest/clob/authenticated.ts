import {
	Chain,
	OrderType,
	ClobClient as SdkClobClient,
	Side as SdkSide,
} from '@polymarket/clob-client'
import { Wallet } from 'ethers'

import { CLOB_API_HOST } from '../../../constants'
import { ConditionId, OrderId, TokenId, WalletAddress } from '../../../types/ids'

import type { ApiKeyCreds, OpenOrder } from '@polymarket/clob-client'
import type { ApiCredentials, PolymarketClientOptions } from '../../../types/domain/client'
import type { Order, OrderResult, Side } from '../../../types/domain/orders'

/** Signature type for EOA wallet authentication. */
const SIGNATURE_TYPE_EOA = 0

/**
 * Authenticated Polymarket client wrapping the official `@polymarket/clob-client` SDK.
 *
 * Use this for any operation that requires signing or API credentials:
 * - Order placement/cancellation
 * - Credential derivation
 * - User-specific data (orders, positions via authenticated endpoints)
 *
 * @see https://docs.polymarket.com/quickstart/first-order
 */
export class ClobPolymarketClient {
	private readonly host: string
	private readonly funderAddress: WalletAddress
	private sdk: SdkClobClient | null = null
	private _wallet: Wallet | null = null

	/**
	 * Create a new authenticated Polymarket client.
	 *
	 * Note: The wallet is lazily initialized on first use to allow
	 * construction with invalid keys (useful for testing).
	 *
	 * @param options - Client configuration options
	 */
	constructor(private readonly options: PolymarketClientOptions) {
		this.host = options.host ?? CLOB_API_HOST
		this.funderAddress = WalletAddress(options.walletAddress)
	}

	/**
	 * Lazily-initialized ethers Wallet instance.
	 *
	 * Defers wallet creation until first access to avoid throwing
	 * during construction if the private key is invalid.
	 *
	 * @returns The ethers Wallet instance
	 */
	private get wallet(): Wallet {
		if (!this._wallet) {
			this._wallet = new Wallet(this.options.privateKey)
		}

		return this._wallet
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Authentication
	// ─────────────────────────────────────────────────────────────────────────────

	/**
	 * Derive or create API credentials using the SDK.
	 *
	 * This calls `createOrDeriveApiKey()` on the underlying SDK, which will
	 * either create new credentials or derive existing ones from the private key.
	 *
	 * @returns The derived API credentials
	 */
	async deriveCredentials(): Promise<ApiCredentials> {
		const wallet = new Wallet(this.options.privateKey)
		const tempClient = new SdkClobClient(this.host, Chain.POLYGON, wallet)
		const creds = await tempClient.createOrDeriveApiKey()

		this.initSdk(creds)

		return this.toApiCredentials(creds)
	}

	/**
	 * Set API credentials if already derived externally.
	 *
	 * Use this when you have previously stored credentials and want to
	 * restore them without re-deriving from the private key.
	 *
	 * @param creds - API credentials to set
	 */
	setCredentials(creds: ApiCredentials): void {
		this.initSdk(this.toSdkCreds(creds))
	}

	/**
	 * Get the currently stored API credentials.
	 *
	 * @returns The stored API credentials
	 * @throws Error if credentials have not been set via `deriveCredentials()` or `setCredentials()`
	 */
	getCredentials(): ApiCredentials {
		if (!this.sdk?.creds) {
			throw new Error('Credentials not set. Call deriveCredentials() first.')
		}

		return this.toApiCredentials(this.sdk.creds)
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Orders
	// ─────────────────────────────────────────────────────────────────────────────

	/**
	 * Create and submit a new limit order.
	 *
	 * Automatically fetches the market's tick size and negative risk status
	 * if not provided in options.
	 *
	 * @param tokenId - Market token ID (the outcome token you want to trade)
	 * @param side - Order side: 'BUY' to go long, 'SELL' to go short
	 * @param price - Order price in the 0-1 range (e.g., 0.65 = 65 cents)
	 * @param size - Order size in number of shares
	 * @param options - Optional order configuration
	 * @returns Result with success status and order ID if successful
	 */
	async createOrder(
		tokenId: TokenId,
		side: Side,
		price: number,
		size: number,
		options?: { negRisk?: boolean },
	): Promise<OrderResult> {
		const sdk = this.requireSdk()

		try {
			const tickSize = await sdk.getTickSize(tokenId)
			const negRisk = options?.negRisk ?? (await sdk.getNegRisk(tokenId))

			const result = await sdk.createAndPostOrder(
				{
					tokenID: tokenId,
					side: side === 'BUY' ? SdkSide.BUY : SdkSide.SELL,
					price,
					size,
				},
				{ tickSize, negRisk },
				OrderType.GTC,
			)
			return { success: true, orderId: result?.orderID ? OrderId(result.orderID) : undefined }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Cancel all orders for a specific market.
	 *
	 * @param conditionId - Market condition ID (identifies the market, not the token)
	 * @returns A promise that resolves when cancellation is complete
	 */
	async cancelAllForMarket(conditionId: ConditionId): Promise<void> {
		const sdk = this.requireSdk()
		await sdk.cancelMarketOrders({ market: conditionId })
	}

	/**
	 * Cancel all open orders across all markets.
	 *
	 * @returns A promise that resolves when all orders are cancelled
	 */
	async cancelAll(): Promise<void> {
		const sdk = this.requireSdk()
		await sdk.cancelAll()
	}

	/**
	 * Get all open orders for this wallet.
	 *
	 * @returns An array of open orders
	 */
	async getOrders(): Promise<Order[]> {
		const sdk = this.requireSdk()
		const orders = await sdk.getOpenOrders()

		return orders.map(o => this.toOrder(o))
	}

	/**
	 * Get open orders for a specific market.
	 *
	 * @param conditionId - Market condition ID
	 * @returns An array of open orders for the specified market
	 */
	async getMarketOrders(conditionId: ConditionId): Promise<Order[]> {
		const sdk = this.requireSdk()
		const orders = await sdk.getOpenOrders({ market: conditionId })

		return orders.map(o => this.toOrder(o))
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Balances (authenticated CLOB endpoints)
	// ─────────────────────────────────────────────────────────────────────────────

	/**
	 * Get USDC balance available for trading.
	 *
	 * @returns The USDC balance in dollars (already divided by 1e6)
	 */
	async getUsdcBalance(): Promise<number> {
		const sdk = this.requireSdk()
		const balances = await sdk.getBalanceAllowance()
		return Number(balances.balance) / 1e6
	}

	/**
	 * Get the wallet address (funder) for this client.
	 *
	 * Useful for passing to Data API calls.
	 *
	 * @returns The wallet address
	 */
	getWalletAddress(): WalletAddress {
		return this.funderAddress
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// Internal helpers
	// ─────────────────────────────────────────────────────────────────────────────

	/**
	 * Initialize the underlying SDK client with credentials.
	 *
	 * @param creds - SDK-format API credentials
	 */
	private initSdk(creds: ApiKeyCreds): void {
		this.sdk = new SdkClobClient(
			this.host,
			Chain.POLYGON,
			this.wallet,
			creds,
			SIGNATURE_TYPE_EOA,
			this.funderAddress,
		)
	}

	/**
	 * Get the SDK instance, throwing if not initialized.
	 *
	 * @returns The initialized SDK client
	 * @throws Error if credentials have not been set
	 */
	private requireSdk(): SdkClobClient {
		if (!this.sdk) {
			throw new Error('SDK not initialized. Call deriveCredentials() first.')
		}

		return this.sdk
	}

	/**
	 * Convert SDK credentials to our public API format.
	 *
	 * @param creds - SDK-format credentials
	 * @returns Public API credentials format
	 */
	private toApiCredentials(creds: ApiKeyCreds): ApiCredentials {
		return {
			apiKey: creds.key,
			apiSecret: creds.secret,
			apiPassphrase: creds.passphrase,
		}
	}

	/**
	 * Convert our public API credentials to SDK format.
	 *
	 * @param creds - Public API credentials
	 * @returns SDK-format credentials
	 */
	private toSdkCreds(creds: ApiCredentials): ApiKeyCreds {
		return {
			key: creds.apiKey,
			secret: creds.apiSecret,
			passphrase: creds.apiPassphrase,
		}
	}

	/**
	 * Convert SDK order format to our public Order type.
	 *
	 * @param o - SDK open order
	 * @returns Public Order format
	 */
	private toOrder(o: OpenOrder): Order {
		return {
			id: OrderId(o.id),
			tokenId: TokenId(o.asset_id),
			side: o.side === 'BUY' ? 'BUY' : 'SELL',
			price: Number(o.price),
			originalSize: Number(o.original_size),
			sizeMatched: Number(o.size_matched),
		}
	}
}
