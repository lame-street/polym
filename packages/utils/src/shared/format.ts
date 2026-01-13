/**
 * Formatting Utilities
 */

/**
 * Pluralize a word based on count.
 *
 * @param count - The number to check
 * @param singular - The singular form
 * @param plural - The plural form (defaults to singular + 's')
 * @returns The appropriate form
 *
 * @example
 * pluralize(1, 'event')  // 'event'
 * pluralize(5, 'event')  // 'events'
 * pluralize(0, 'event')  // 'events'
 * pluralize(2, 'child', 'children')  // 'children'
 */
export function pluralize(count: number, singular: string, plural?: string): string {
	return count === 1 ? singular : (plural ?? `${singular}s`)
}
