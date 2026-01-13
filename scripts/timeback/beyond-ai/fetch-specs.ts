#!/usr/bin/env bun
/**
 * Fetch OpenAPI specs from Alpha-1EdTech API endpoints.
 *
 * Downloads YAML files to docs/timeback/beyond-ai/apis/
 *
 * Usage:
 *   bun scripts/timeback/fetch-openapi-specs.ts
 */
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { runSteps } from '@timeback/internal-utils/server'

import type { StepConfig } from '@timeback/internal-utils/server'

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const APIS_DIR = 'docs/timeback/beyond-ai/apis'
const ORIGINALS_DIR = join(APIS_DIR, '.originals')

const OPENAPI_SPECS: { name: string; url: string }[] = [
	{ name: 'oneroster-api', url: 'https://api.alpha-1edtech.ai/openapi.yaml' },
	{ name: 'edubridge-api', url: 'https://api.alpha-1edtech.ai/edubridge/openapi.yaml' },
	{ name: 'caliper-api', url: 'https://caliper.alpha-1edtech.ai/openapi.yaml' },
	{ name: 'webhooks-api', url: 'https://caliper.alpha-1edtech.ai/webhooks/openapi.yaml' },
	{ name: 'timeback-events-api', url: 'https://caliper.alpha-1edtech.ai/timeback/openapi.yaml' },
	{ name: 'qti-api', url: 'https://qti.alpha-1edtech.ai/openapi.yaml' },
	{ name: 'powerpath-api', url: 'https://api.alpha-1edtech.ai/powerpath/openapi.yaml' },
	{ name: 'case-api', url: 'https://api.alpha-1edtech.ai/case/openapi.yaml' },
	// OpenBadge is crossed out in the docs, skipping
	{ name: 'clr-api', url: 'https://api.alpha-1edtech.ai/clr/openapi.yaml' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function fetchSpec(name: string, url: string): Promise<{ name: string; size: number }> {
	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`)
	}

	const content = await response.text()
	const outFile = join(ORIGINALS_DIR, `${name}.yaml`)
	await Bun.write(outFile, content)

	return { name, size: content.length }
}

function formatSize(bytes: number): string {
	return `${(bytes / 1024).toFixed(1)} KB`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

if (!existsSync(ORIGINALS_DIR)) {
	mkdirSync(ORIGINALS_DIR, { recursive: true })
}

interface SpecResult {
	name: string
	size: number
}

const steps: Record<string, StepConfig> = {}

for (const { name, url } of OPENAPI_SPECS) {
	steps[name] = {
		text: `Fetching ${name}...`,
		action: () => fetchSpec(name, url),
		successText: result => {
			const { name: specName, size } = result as SpecResult
			return `${specName} (${formatSize(size)})`
		},
	}
}

await runSteps(steps)
