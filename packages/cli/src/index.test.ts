import { expect, test } from 'bun:test'

test('cli module exports commands', async () => {
	const mod = await import('./index')

	expect(mod.runBotCommand).toBeDefined()
	expect(mod.runMarketsSnapshot).toBeDefined()
	expect(mod.runAccountStats).toBeDefined()
})
