#!/usr/bin/env bun
/**
 * Generate API path profiles from OpenAPI specs.
 *
 * Reads YAML files from docs/timeback/learn-with-ai/apis/ and generates
 * a directory per API with endpoints.yaml, request.yaml, and response.yaml.
 *
 * Usage:
 *   bun scripts/timeback/learn-with-ai/generate-api-paths.ts
 */
import { YAML } from 'bun'

import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { basename, join } from 'node:path'

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const APIS_DIR = 'docs/timeback/learn-with-ai/apis'
const ORIGINALS_DIR = join(APIS_DIR, '.originals')

const ACRONYMS = new Set(['clr', 'qti', 'case', 'api', 'cf', 'lti', 'jwt', 'jwks'])

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
	components?: { schemas?: Record<string, SchemaNode> }
}

let currentSpec: OpenAPISpec = {}

interface OperationObject {
	requestBody?: {
		content?: Record<string, { schema?: SchemaNode }>
	}
	responses?: Record<string, ResponseObject>
}

interface ResponseObject {
	content?: Record<string, { schema?: SchemaNode }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema to YAML representation
// ─────────────────────────────────────────────────────────────────────────────

function resolveRef(ref: string): SchemaNode | undefined {
	const match = ref.match(/^#\/components\/schemas\/(.+)$/)
	if (match && currentSpec.components?.schemas) {
		return currentSpec.components.schemas[match[1]]
	}
	return undefined
}

function schemaToType(schema: SchemaNode, indent = 0, seen = new Set<string>()): string {
	if (!schema) return 'unknown'

	if (schema.$ref) {
		if (seen.has(schema.$ref)) {
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

	if (schema.anyOf || schema.oneOf) {
		const options = schema.anyOf ?? schema.oneOf ?? []
		const types = options.map(opt => schemaToType(opt, 0, seen))

		if (types.some(t => t.includes('\n'))) {
			const lines: string[] = []
			for (const t of types) {
				const typeLines = t.split('\n')
				typeLines.forEach((line, i) => {
					lines.push(i === 0 ? `- ${line}` : `  ${line}`)
				})
			}
			return lines.join('\n')
		}

		return types.join(' | ')
	}

	if (schema.allOf) {
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

	if (schema.items.anyOf || schema.items.oneOf) {
		const itemType = schemaToType(schema.items, indent, seen)
		if (itemType.includes('\n')) return itemType
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
			if (valueType.includes('\n')) {
				const lines = ['propertyName*:']
				for (const line of valueType.split('\n')) {
					lines.push(`  ${line}`)
				}
				return lines.join('\n')
			}
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
		const lineIndent = isArrayItem ? (idx === 0 ? '- ' : '  ') : baseIndent

		const valueType = schemaToType(value, 0, seen)
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
	const content = operation.requestBody?.content
	if (!content) return undefined

	const schema =
		content['application/json']?.schema ??
		content['application/x-www-form-urlencoded']?.schema ??
		Object.values(content)[0]?.schema

	if (!schema) return undefined
	return schemaToType(schema as SchemaNode)
}

function extractResponse(operation: OperationObject): string | undefined {
	if (!operation.responses) return undefined

	const shapes: string[] = []
	for (const [statusCode, response] of Object.entries(operation.responses)) {
		if (!statusCode.startsWith('2')) continue

		const content = response?.content
		if (content) {
			const schema = content['application/json']?.schema ?? Object.values(content)[0]?.schema
			if (schema) shapes.push(schemaToType(schema as SchemaNode))
		}
	}

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
		if (seg.match(/^v?\d/)) continue
		if (['ims', 'api', 'rostering', 'events', 'auth'].includes(seg)) continue
		return formatCategoryTitle(seg)
	}

	return 'General'
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
// Generate profile YAML files
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

// ─────────────────────────────────────────────────────────────────────────────
// Process API files
// ─────────────────────────────────────────────────────────────────────────────

async function processApiFile(
	filepath: string,
): Promise<{ name: string; endpoints: number } | null> {
	const content = await Bun.file(filepath).text()
	const spec = YAML.parse(content) as OpenAPISpec
	currentSpec = spec

	const paths = extractPaths(spec)
	if (paths.length === 0) return null

	const groups = groupPaths(paths)
	const name = basename(filepath, '-api.yaml')
	const profileDir = join(APIS_DIR, name)

	if (existsSync(profileDir)) rmSync(profileDir, { recursive: true })
	mkdirSync(profileDir, { recursive: true })

	await Bun.write(join(profileDir, 'endpoints.yaml'), generateEndpointsYaml(groups))

	const requestYaml = generateSchemaYaml(groups, m => m.requestBody)
	const responseYaml = generateSchemaYaml(groups, m => m.response)

	if (requestYaml.trim()) await Bun.write(join(profileDir, 'request.yaml'), requestYaml)
	if (responseYaml.trim()) await Bun.write(join(profileDir, 'response.yaml'), responseYaml)

	return { name, endpoints: paths.reduce((acc, p) => acc + p.methods.length, 0) }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const files = readdirSync(ORIGINALS_DIR).filter(f => f.endsWith('-api.yaml'))
const results: { api: string; endpoints: number }[] = []

for (const file of files) {
	const result = await processApiFile(join(ORIGINALS_DIR, file))
	if (result) {
		results.push({ api: result.name, endpoints: result.endpoints })
	}
}

console.table(results)
