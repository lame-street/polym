import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Branded ID Types
// ─────────────────────────────────────────────────────────────────────────────

declare const __brand: unique symbol
type Brand<T, B extends string> = T & { readonly [__brand]: B }

/** ERC1155 conditional token ID */
export type TokenId = Brand<string, 'TokenId'>

/** Market condition ID (CTF condition) */
export type ConditionId = Brand<string, 'ConditionId'>

/** Gamma market ID (numeric string) */
export type MarketId = Brand<string, 'MarketId'>

/** Gamma event ID */
export type EventId = Brand<string, 'EventId'>

/** Ethereum wallet address */
export type WalletAddress = Brand<string, 'WalletAddress'>

/** Order ID */
export type OrderId = Brand<string, 'OrderId'>

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schemas for IDs (runtime validation)
// ─────────────────────────────────────────────────────────────────────────────

/** Schema for TokenId - validates non-empty string */
export const tokenIdSchema = z
	.string()
	.min(1, 'TokenId cannot be empty')
	.transform(s => s as TokenId)

/** Schema for ConditionId - validates non-empty string */
export const conditionIdSchema = z
	.string()
	.min(1, 'ConditionId cannot be empty')
	.transform(s => s as ConditionId)

/** Schema for MarketId - validates non-empty string */
export const marketIdSchema = z
	.string()
	.min(1, 'MarketId cannot be empty')
	.transform(s => s as MarketId)

/** Schema for EventId - validates non-empty string */
export const eventIdSchema = z
	.string()
	.min(1, 'EventId cannot be empty')
	.transform(s => s as EventId)

/** Schema for WalletAddress - validates 0x-prefixed hex string */
export const walletAddressSchema = z
	.string()
	.regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
	.transform(s => s as WalletAddress)

/** Schema for OrderId - validates non-empty string */
export const orderIdSchema = z
	.string()
	.min(1, 'OrderId cannot be empty')
	.transform(s => s as OrderId)

// ─────────────────────────────────────────────────────────────────────────────
// Constructor Functions (escape hatches for trusted sources)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a TokenId from a trusted string (no validation).
 *
 * @param s - String to brand as TokenId
 * @returns Branded TokenId
 */
export const TokenId = (s: string): TokenId => s as TokenId

/**
 * Create a ConditionId from a trusted string (no validation).
 *
 * @param s - String to brand as ConditionId
 * @returns Branded ConditionId
 */
export const ConditionId = (s: string): ConditionId => s as ConditionId

/**
 * Create a MarketId from a trusted string (no validation).
 *
 * @param s - String to brand as MarketId
 * @returns Branded MarketId
 */
export const MarketId = (s: string): MarketId => s as MarketId

/**
 * Create an EventId from a trusted string (no validation).
 *
 * @param s - String to brand as EventId
 * @returns Branded EventId
 */
export const EventId = (s: string): EventId => s as EventId

/**
 * Create a WalletAddress from a trusted string (no validation).
 *
 * @param s - String to brand as WalletAddress
 * @returns Branded WalletAddress
 */
export const WalletAddress = (s: string): WalletAddress => s as WalletAddress

/**
 * Create an OrderId from a trusted string (no validation).
 *
 * @param s - String to brand as OrderId
 * @returns Branded OrderId
 */
export const OrderId = (s: string): OrderId => s as OrderId
