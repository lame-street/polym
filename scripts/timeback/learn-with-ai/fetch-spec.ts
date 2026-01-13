#!/usr/bin/env bun
/**
 * Fetch and unbundle the Learn With AI OpenAPI specification.
 *
 * 1. Fetches the bundled spec from docs.platform.timeback.com
 * 2. Extracts the raw JSON from the HTML
 * 3. Unbundles by tags into separate YAML files
 *
 * Usage:
 *   bun scripts/timeback/learn-with-ai/fetch-spec.ts
 */
import { YAML } from 'bun'

import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_URL = 'https://docs.platform.timeback.com/api-reference'
const APIS_DIR = 'docs/timeback/learn-with-ai/apis'
const ORIGINALS_DIR = join(APIS_DIR, '.originals')

const ACRONYMS = new Set(['clr', 'qti', 'case', 'api', 'cf', 'lti', 'jwt', 'jwks'])

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TagInfo {
	name: string
	description?: string
}

interface SchemaNode {
	type?: string | string[]
	properties?: Record<string, SchemaNode>
	items?: SchemaNode
	enum?: (string | number | boolean)[]
	additionalProperties?: boolean | SchemaNode
	required?: string[]
	$ref?: string
	nullable?: boolean
	const?: string | number | boolean
	anyOf?: SchemaNode[]
	oneOf?: SchemaNode[]
	allOf?: SchemaNode[]
}

interface OperationObject {
	tags?: string[]
	summary?: string
	description?: string
	operationId?: string
	security?: Record<string, string[]>[]
	requestBody?: {
		required?: boolean
		content?: Record<string, { schema?: SchemaNode }>
	}
	responses?: Record<string, ResponseObject>
	parameters?: unknown[]
}

interface ResponseObject {
	description?: string
	content?: Record<string, { schema?: SchemaNode }>
}

interface PathItem {
	get?: OperationObject
	post?: OperationObject
	put?: OperationObject
	patch?: OperationObject
	delete?: OperationObject
	head?: OperationObject
	options?: OperationObject
	parameters?: unknown[]
}

interface OpenAPISpec {
	openapi?: string
	info?: { title?: string; description?: string; version?: string }
	tags?: TagInfo[]
	paths?: Record<string, PathItem>
	components?: {
		schemas?: Record<string, SchemaNode>
		responses?: Record<string, ResponseObject>
		securitySchemes?: Record<string, unknown>
		parameters?: Record<string, unknown>
	}
	servers?: { url: string; description?: string }[]
	security?: Record<string, string[]>[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch and Extract
// ─────────────────────────────────────────────────────────────────────────────

function decodeHtmlEntities(str: string): string {
	return str
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&#39;/g, "'")
		.replace(/&apos;/g, "'")
}

function extractSpecFromHtml(html: string): string | null {
	const patterns = [
		/class="api-references-layout"[^>]*?raw='([^']+)'/,
		/class="api-references-layout"[^>]*?raw="([^"]+)"/,
		/:raw='([^']+)'/,
		/data-raw='([^']+)'/,
	]

	for (const pattern of patterns) {
		const match = html.match(pattern)
		if (match?.[1]) return decodeHtmlEntities(match[1])
	}

	const scriptMatch = html.match(
		/<script[^>]*(?:type="application\/json"|id="openapi-spec")[^>]*>([\s\S]*?)<\/script>/,
	)
	if (scriptMatch?.[1]) return scriptMatch[1].trim()

	const embeddedMatch = html.match(/\{"openapi":\s*"3\.[^}]+[\s\S]*?"paths":\s*\{[\s\S]*?\}\s*\}/)
	if (embeddedMatch?.[0]) return embeddedMatch[0]

	return null
}

async function fetchBundledSpec(): Promise<OpenAPISpec> {
	const response = await fetch(SOURCE_URL)
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
	}

	const html = await response.text()
	const rawValue = extractSpecFromHtml(html)

	if (!rawValue) {
		console.log('\n🔍 Debug info:')
		console.log(`  Contains 'api-references-layout': ${html.includes('api-references-layout')}`)
		console.log(`  Contains 'raw=': ${html.includes('raw=')}`)
		console.log(`  Contains 'openapi': ${html.includes('openapi')}`)

		const rawIndex = html.indexOf('raw=')
		if (rawIndex > -1) {
			console.log(`\n  Snippet around 'raw=':`)
			console.log(`  ${html.substring(rawIndex - 50, rawIndex + 200)}`)
		}

		throw new Error('Could not find the raw attribute in the HTML')
	}

	return JSON.parse(rawValue) as OpenAPISpec
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function tagToFilename(tag: string): string {
	return tag
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
		.toLowerCase()
}

function formatCategoryTitle(segment: string): string {
	return segment
		.replace(/[-_]/g, ' ')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.split(' ')
		.map(word =>
			ACRONYMS.has(word.toLowerCase())
				? word.toUpperCase()
				: word.charAt(0).toUpperCase() + word.slice(1),
		)
		.join(' ')
}

// ─────────────────────────────────────────────────────────────────────────────
// Unbundle spec by tags
// ─────────────────────────────────────────────────────────────────────────────

function collectUsedSchemas(spec: OpenAPISpec, paths: Record<string, PathItem>): Set<string> {
	const used = new Set<string>()

	function collectFromSchema(schema: SchemaNode | undefined, visited = new Set<string>()) {
		if (!schema) return

		if (schema.$ref) {
			const refName = schema.$ref.replace('#/components/schemas/', '')
			if (!visited.has(refName)) {
				visited.add(refName)
				used.add(refName)
				const refSchema = spec.components?.schemas?.[refName]
				if (refSchema) collectFromSchema(refSchema, visited)
			}
		}

		if (schema.properties) {
			for (const prop of Object.values(schema.properties)) {
				collectFromSchema(prop, visited)
			}
		}

		if (schema.items) collectFromSchema(schema.items, visited)
		if (schema.anyOf) schema.anyOf.forEach(s => collectFromSchema(s, visited))
		if (schema.oneOf) schema.oneOf.forEach(s => collectFromSchema(s, visited))
		if (schema.allOf) schema.allOf.forEach(s => collectFromSchema(s, visited))
		if (typeof schema.additionalProperties === 'object') {
			collectFromSchema(schema.additionalProperties, visited)
		}
	}

	function collectFromResponse(response: ResponseObject | undefined) {
		if (!response?.content) return
		for (const contentType of Object.values(response.content)) {
			collectFromSchema(contentType.schema)
		}
	}

	function processResponseEntry(response: ResponseObject | { $ref: string }) {
		if ('$ref' in response) {
			const refName = (response.$ref as string).replace('#/components/responses/', '')
			collectFromResponse(spec.components?.responses?.[refName])
		} else {
			collectFromResponse(response as ResponseObject)
		}
	}

	function processOperation(operation: OperationObject) {
		if (operation.requestBody?.content) {
			for (const contentType of Object.values(operation.requestBody.content)) {
				collectFromSchema(contentType.schema)
			}
		}
		if (operation.responses) {
			Object.values(operation.responses).forEach(processResponseEntry)
		}
	}

	const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const

	for (const pathItem of Object.values(paths)) {
		for (const method of HTTP_METHODS) {
			const operation = pathItem[method]
			if (operation) processOperation(operation)
		}
	}

	return used
}

function unbundleByTag(spec: OpenAPISpec): Map<string, OpenAPISpec> {
	const tagSpecs = new Map<string, OpenAPISpec>()
	const tags = spec.tags ?? []

	for (const tag of tags) {
		const tagPaths: Record<string, PathItem> = {}

		for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
			const taggedOperations: Partial<PathItem> = {}
			let hasOperations = false

			for (const [method, operation] of Object.entries(pathItem)) {
				if (method === 'parameters') continue
				const op = operation as OperationObject
				if (op.tags?.includes(tag.name)) {
					;(taggedOperations as Record<string, unknown>)[method] = op
					hasOperations = true
				}
			}

			if (hasOperations) {
				if (pathItem.parameters) {
					taggedOperations.parameters = pathItem.parameters
				}
				tagPaths[path] = taggedOperations as PathItem
			}
		}

		if (Object.keys(tagPaths).length === 0) continue

		const usedSchemas = collectUsedSchemas(spec, tagPaths)

		const schemas: Record<string, SchemaNode> = {}
		for (const schemaName of usedSchemas) {
			if (spec.components?.schemas?.[schemaName]) {
				schemas[schemaName] = spec.components.schemas[schemaName]
			}
		}

		const usedResponses = new Set<string>()
		const extractResponseRef = (response: unknown): string | null => {
			if (typeof response === 'object' && response && '$ref' in response) {
				return (response.$ref as string).replace('#/components/responses/', '')
			}
			return null
		}

		for (const pathItem of Object.values(tagPaths)) {
			for (const operation of Object.values(pathItem)) {
				if (typeof operation !== 'object' || !('responses' in operation)) continue
				const responses = (operation as OperationObject).responses ?? {}
				Object.values(responses).forEach(r => {
					const refName = extractResponseRef(r)
					if (refName) usedResponses.add(refName)
				})
			}
		}

		const responses: Record<string, ResponseObject> = {}
		for (const responseName of usedResponses) {
			if (spec.components?.responses?.[responseName]) {
				responses[responseName] = spec.components.responses[responseName]
			}
		}

		const tagSpec: OpenAPISpec = {
			openapi: spec.openapi,
			info: {
				title: `TimeBack Platform - ${formatCategoryTitle(tag.name)} API`,
				description: tag.description ?? spec.info?.description,
				version: spec.info?.version,
			},
			tags: [tag],
			servers: spec.servers,
			paths: tagPaths,
			components: {
				schemas: Object.keys(schemas).length > 0 ? schemas : undefined,
				responses: Object.keys(responses).length > 0 ? responses : undefined,
				securitySchemes: spec.components?.securitySchemes,
				parameters: spec.components?.parameters,
			},
			security: spec.security,
		}

		if (tagSpec.components) {
			const components = tagSpec.components as Record<string, unknown>
			for (const key of Object.keys(components)) {
				if (
					components[key] === undefined ||
					Object.keys(components[key] as object).length === 0
				) {
					delete components[key]
				}
			}
			if (Object.keys(tagSpec.components).length === 0) {
				delete tagSpec.components
			}
		}

		tagSpecs.set(tag.name, tagSpec)
	}

	return tagSpecs
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

if (!existsSync(ORIGINALS_DIR)) {
	mkdirSync(ORIGINALS_DIR, { recursive: true })
}

try {
	const bundledSpec = await fetchBundledSpec()
	const tagSpecs = unbundleByTag(bundledSpec)
	const results: { api: string; file: string; size: string }[] = []

	for (const [tag, spec] of tagSpecs) {
		const filename = `${tagToFilename(tag)}-api.yaml`
		const content = YAML.stringify(spec)
		await Bun.write(join(ORIGINALS_DIR, filename), content)
		results.push({
			api: tag,
			file: filename,
			size: `${(content.length / 1024).toFixed(1)} KB`,
		})
	}

	console.table(results)
} catch (error) {
	console.error('❌ Error:', error)
	process.exit(1)
}
