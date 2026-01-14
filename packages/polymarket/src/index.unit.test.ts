import { expect, test } from 'bun:test'

import { PolymarketClient } from './index'

// Valid 32-byte private key for testing (DO NOT use in production)
const TEST_PRIVATE_KEY = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
const TEST_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890'

test('PolymarketClient throws when credentials not set', () => {
	const client = new PolymarketClient({
		privateKey: TEST_PRIVATE_KEY,
		walletAddress: TEST_WALLET_ADDRESS,
	})

	expect(() => client.getCredentials()).toThrow('Credentials not set')
})

test('PolymarketClient.setCredentials stores credentials', () => {
	const client = new PolymarketClient({
		privateKey: TEST_PRIVATE_KEY,
		walletAddress: TEST_WALLET_ADDRESS,
	})

	const creds = {
		apiKey: 'key',
		apiSecret: 'secret',
		apiPassphrase: 'pass',
	}

	client.setCredentials(creds)
	expect(client.getCredentials()).toEqual(creds)
})
