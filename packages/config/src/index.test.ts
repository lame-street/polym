import { expect, test } from 'bun:test'

import { loadConfig, requireEnv } from './load'

test('loadConfig throws when file not found', async () => {
	expect(loadConfig('nonexistent.json')).rejects.toThrow()
})

test('requireEnv throws when variable missing', () => {
	expect(() => requireEnv('NONEXISTENT_VAR_12345')).toThrow(
		'Missing required environment variable: NONEXISTENT_VAR_12345',
	)
})

test('requireEnv returns value when set', () => {
	process.env.TEST_VAR_FOR_CONFIG = 'test_value'
	expect(requireEnv('TEST_VAR_FOR_CONFIG')).toBe('test_value')
	delete process.env.TEST_VAR_FOR_CONFIG
})
