/**
 * Polymarket types - public exports.
 *
 * This module exports domain types by default.
 * Wire schemas are available via './wire' for advanced users.
 */

// Branded ID types and constructors
export * from './ids'

// Domain types (what consumers use)
export * from './domain'

// Wire types are NOT re-exported by default.
// Import from './wire' explicitly if needed:
// import { gammaMarketWireSchema } from '@polym/sdk/types/wire'
