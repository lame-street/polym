#!/usr/bin/env bun
/**
 * Generate API path profiles from OpenAPI specs.
 *
 * Reads YAML files from docs/timeback/beyond-ai/apis/ and generates
 * a directory per API with endpoints.yaml, request/, and response/ files.
 *
 * Usage:
 *   bun scripts/timeback/generate-api-paths.ts
 */
import { YAML } from 'bun'

import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { basename, join } from 'node:path'

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const APIS_DIR = 'docs/timeback/beyond-ai/apis'
const ORIGINALS_DIR = join(APIS_DIR, '.originals')

/** Known acronyms that should be uppercased in titles */
const ACRONYMS = new Set(['clr', 'qti', 'case', 'api', 'cf'])

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MethodInfo {
	method: string
	requestBody?: string
	response?: string
}

interface PathInfo {
	path: string
	methods: MethodInfo[]
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

interface OpenAPISpec {
	paths?: Record<string, Record<string, OperationObject>>
	components?: {
		schemas?: Record<string, SchemaNode>
	}
}

// Global ref to current spec for resolving $refs
let currentSpec: OpenAPISpec = {}

interface OperationObject {
	requestBody?: {
		content?: {
			'application/json'?: {
				schema?: SchemaNode
			}
		}
	}
	responses?: Record<string, ResponseObject>
}

interface ResponseObject {
	content?: {
		'application/json'?: {
			schema?: SchemaNode
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema to YAML representation
// ─────────────────────────────────────────────────────────────────────────────

function resolveRef(ref: string): SchemaNode | undefined {
	// Handle #/components/schemas/Foo
	const match = ref.match(/^#\/components\/schemas\/(.+)$/)
	if (match && currentSpec.components?.schemas) {
		return currentSpec.components.schemas[match[1]]
	}
	return undefined
}

function schemaToType(schema: SchemaNode, indent = 0, seen = new Set<string>()): string {
	if (!schema) return 'unknown'

	// Resolve $ref to actual schema (with cycle detection)
	if (schema.$ref) {
		if (seen.has(schema.$ref)) {
			// Circular reference - just return the name
			return schema.$ref.split('/').pop() ?? 'unknown'
		}
		const resolved = resolveRef(schema.$ref)
		if (resolved) {
			seen.add(schema.$ref)
			return schemaToType(resolved, indent, seen)
		}
		return schema.$ref.split('/').pop() ?? 'unknown'
	}

	if (schema.const !== undefined) return JSON.stringify(schema.const)
	if (schema.enum) return `[${schema.enum.join(', ')}]`

	// Handle anyOf/oneOf - format as array if complex
	if (schema.anyOf || schema.oneOf) {
		const options = schema.anyOf ?? schema.oneOf ?? []
		const types = options.map(opt => schemaToType(opt, 0, seen))

		// If any option is multiline (complex object), format as YAML array
		if (types.some(t => t.includes('\n'))) {
			const lines: string[] = []
			for (const t of types) {
				const typeLines = t.split('\n')
				// First line gets `- `, rest get 2-space indent to align with content after `- `
				typeLines.forEach((line, i) => {
					lines.push(i === 0 ? `- ${line}` : `  ${line}`)
				})
			}
			return lines.join('\n')
		}

		return types.join(' | ')
	}

	// Handle allOf - merge schemas
	if (schema.allOf) {
		// For simplicity, just use the first schema with properties
		const withProps = schema.allOf.find(s => s.properties || s.$ref)
		if (withProps) return schemaToType(withProps, indent, seen)
	}

	let type = schema.type
	if (Array.isArray(type)) {
		const nonNull = type.filter(t => t !== 'null')
		const hasNull = type.includes('null')
		if (nonNull.length === 1) {
			const base = schemaToType({ ...schema, type: nonNull[0] }, indent, seen)
			return hasNull ? `${base}?` : base
		}
		return type.join('|')
	}

	return formatType(schema, type, indent, seen)
}

function formatType(
	schema: SchemaNode,
	type: string | undefined,
	indent: number,
	seen: Set<string>,
): string {
	switch (type) {
		case 'string':
		case 'number':
		case 'integer':
		case 'boolean':
		case 'null':
			return type === 'integer' ? 'number' : type
		case 'array':
			return formatArrayType(schema, indent, seen)
		case 'object':
			return formatObjectType(schema, indent, seen)
		default:
			if (schema.properties) return formatObjectType(schema, indent, seen)
			return 'unknown'
	}
}

function formatArrayType(schema: SchemaNode, indent: number, seen: Set<string>): string {
	if (!schema.items) return 'unknown[]'

	// Handle items with anyOf/oneOf - format as list of options
	if (schema.items.anyOf || schema.items.oneOf) {
		const itemType = schemaToType(schema.items, indent, seen)
		// If already formatted as array (starts with newline + spaces + -), return as-is
		if (itemType.includes('\n')) {
			return itemType
		}
		return `(${itemType})[]`
	}

	if (schema.items.properties) {
		return formatObjectLines(schema.items, indent, true, seen).join('\n')
	}
	return `${schemaToType(schema.items, indent, seen)}[]`
}

function formatObjectType(schema: SchemaNode, indent: number, seen: Set<string>): string {
	if (!schema.properties) {
		if (schema.additionalProperties) {
			if (typeof schema.additionalProperties === 'boolean') return 'object # untyped'
			const valueType = schemaToType(schema.additionalProperties, indent, seen)
			// If value is multiline (complex object), format as nested YAML with propertyName* placeholder
			if (valueType.includes('\n')) {
				const lines = ['propertyName*:']
				for (const line of valueType.split('\n')) {
					lines.push(`  ${line}`)
				}
				return lines.join('\n')
			}
			// Simple value type - inline notation
			return `Record<string, ${valueType}>`
		}
		return 'object'
	}
	return formatObjectLines(schema, indent, false, seen).join('\n')
}

const JSONLD_PROPS = new Set(['@context', '@type', '@id'])

function formatObjectLines(
	schema: SchemaNode,
	indent: number,
	isArrayItem: boolean,
	seen: Set<string>,
): string[] {
	if (!schema.properties) return ['object']

	const requiredSet = new Set(schema.required ?? [])
	const props = Object.entries(schema.properties).filter(([key]) => !JSONLD_PROPS.has(key))
	const baseIndent = '  '.repeat(indent)
	const lines: string[] = []

	props.forEach(([key, value], idx) => {
		const opt = requiredSet.has(key) ? '' : '?'
		let lineIndent = isArrayItem ? (idx === 0 ? '- ' : '  ') : baseIndent

		const valueType = schemaToType(value, 0, seen)
		// Format as block if multiline OR if value looks like YAML key-value (has `: `)
		const isBlock = valueType.includes('\n') || /^\w+\??: /.test(valueType)

		if (isBlock) {
			lines.push(`${lineIndent}${key}${opt}:`)
			const nestedIndent = isArrayItem ? '    ' : `${baseIndent}  `
			for (const l of valueType.split('\n')) {
				lines.push(`${nestedIndent}${l}`)
			}
		} else {
			lines.push(`${lineIndent}${key}${opt}: ${valueType}`)
		}
	})

	return lines
}

// ─────────────────────────────────────────────────────────────────────────────
// Extract paths from OpenAPI spec
// ─────────────────────────────────────────────────────────────────────────────

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const

function extractRequestBody(operation: OperationObject): string | undefined {
	const schema = operation.requestBody?.content?.['application/json']?.schema
	if (!schema) return undefined
	return schemaToType(schema as SchemaNode)
}

function extractResponse(operation: OperationObject): string | undefined {
	if (!operation.responses) return undefined

	const shapes: string[] = []
	for (const [statusCode, response] of Object.entries(operation.responses)) {
		if (!statusCode.startsWith('2')) continue
		const schema = response?.content?.['application/json']?.schema
		if (schema) shapes.push(schemaToType(schema as SchemaNode))
	}

	// Dedupe and return first unique shape
	const unique = [...new Set(shapes)]
	return unique[0]
}

function extractPaths(spec: OpenAPISpec): PathInfo[] {
	if (!spec.paths) return []

	const results: PathInfo[] = []

	for (const [path, pathItem] of Object.entries(spec.paths)) {
		const methods: MethodInfo[] = []

		for (const method of HTTP_METHODS) {
			const operation = pathItem[method] as OperationObject | undefined
			if (!operation) continue

			methods.push({
				method: method.toUpperCase(),
				requestBody: extractRequestBody(operation),
				response: extractResponse(operation),
			})
		}

		if (methods.length > 0) {
			results.push({ path, methods })
		}
	}

	return results.sort((a, b) => a.path.localeCompare(b.path))
}

// ─────────────────────────────────────────────────────────────────────────────
// Group paths by category
// ─────────────────────────────────────────────────────────────────────────────

function groupPaths(paths: PathInfo[]): Map<string, PathInfo[]> {
	const groups: Map<string, PathInfo[]> = new Map()

	for (const info of paths) {
		const category = extractCategory(info.path)
		const group = groups.get(category) ?? []
		group.push(info)
		groups.set(category, group)
	}

	return groups
}

function extractCategory(path: string): string {
	const segments = path.split('/').filter(Boolean)

	for (let i = segments.length - 1; i >= 0; i--) {
		const seg = segments[i]
		if (seg.startsWith('{') || seg.startsWith(':')) continue
		if (seg.match(/^v\d/)) continue
		if (seg === 'ims' || seg === 'api') continue
		return formatCategory(seg)
	}

	return 'General'
}

function formatCategory(segment: string): string {
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
// Generate YAML files
// ─────────────────────────────────────────────────────────────────────────────

function generateEndpointsYaml(groups: Map<string, PathInfo[]>): string {
	const lines: string[] = []

	for (const [category, paths] of groups) {
		lines.push(`${category}:`)
		for (const info of paths) {
			for (const methodInfo of info.methods) {
				lines.push(`  ${methodInfo.method}: ${info.path}`)
			}
		}
		lines.push('')
	}

	return lines.join('\n')
}

function formatSchemaEntry(method: string, path: string, body: string): string[] {
	const lines = [`${method} ${path}:`]
	for (const line of body.split('\n')) {
		lines.push(`  ${line}`)
	}
	lines.push('')
	return lines
}

function generateSchemaYaml(
	groups: Map<string, PathInfo[]>,
	getBody: (m: MethodInfo) => string | undefined,
): string {
	const lines: string[] = []

	for (const [category, paths] of groups) {
		const categoryLines: string[] = []

		for (const info of paths) {
			for (const methodInfo of info.methods) {
				const body = getBody(methodInfo)
				if (body)
					categoryLines.push(...formatSchemaEntry(methodInfo.method, info.path, body))
			}
		}

		if (categoryLines.length > 0) {
			lines.push(`# ${category}`, ...categoryLines)
		}
	}

	return lines.join('\n')
}

function generateRequestYaml(groups: Map<string, PathInfo[]>): string {
	return generateSchemaYaml(groups, m => m.requestBody)
}

function generateResponseYaml(groups: Map<string, PathInfo[]>): string {
	return generateSchemaYaml(groups, m => m.response)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const yamlFiles = readdirSync(ORIGINALS_DIR)
	.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
	.map(f => join(ORIGINALS_DIR, f))

const results: { api: string; endpoints: number }[] = []

for (const file of yamlFiles) {
	const apiName = basename(file).replace(/\.(yaml|yml)$/, '')
	const content = await Bun.file(file).text()

	let spec: OpenAPISpec
	try {
		spec = YAML.parse(content) as OpenAPISpec
	} catch (e) {
		console.error(`Failed to parse ${apiName}: ${(e as Error).message}`)
		results.push({ api: apiName, endpoints: 0 })
		continue
	}

	// Set current spec for $ref resolution
	currentSpec = spec

	const paths = extractPaths(spec)
	if (paths.length === 0) {
		results.push({ api: apiName, endpoints: 0 })
		continue
	}

	const groups = groupPaths(paths)
	const profileName = apiName.replace(/-api$/, '')
	const apiDir = join(APIS_DIR, profileName)
	if (existsSync(apiDir)) rmSync(apiDir, { recursive: true })
	mkdirSync(apiDir, { recursive: true })

	// Write endpoints.yaml
	await Bun.write(join(apiDir, 'endpoints.yaml'), generateEndpointsYaml(groups))

	// Write request.yaml and response.yaml
	const requestYaml = generateRequestYaml(groups)
	const responseYaml = generateResponseYaml(groups)

	if (requestYaml.trim()) await Bun.write(join(apiDir, 'request.yaml'), requestYaml)
	if (responseYaml.trim()) await Bun.write(join(apiDir, 'response.yaml'), responseYaml)

	const totalMethods = paths.reduce((acc, p) => acc + p.methods.length, 0)
	results.push({ api: apiName, endpoints: totalMethods })
}

console.table(results)
