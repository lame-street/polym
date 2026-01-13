import { stdout } from 'node:process'

/**
 * Whether the terminal supports interactive features (cursor movement).
 * Falls back to false in non-TTY environments (CI, piped output, etc.)
 */
export const isInteractive = stdout.isTTY ?? false

/**
 * ANSI escape sequences for cursor control
 */
export const cursor = {
	hide: '\u001B[?25l',
	show: '\u001B[?25h',
	/**
	 * @param n - Number of lines
	 * @returns ANSI escape sequence to move cursor up
	 */
	up: (n: number) => `\u001B[${n}A`,
	/**
	 * @param n - Number of lines
	 * @returns ANSI escape sequence to move cursor down
	 */
	down: (n: number) => `\u001B[${n}B`,
	/**
	 * @param n - Number of characters
	 * @returns ANSI escape sequence to move cursor forward
	 */
	forward: (n: number) => `\u001B[${n}C`,
	/**
	 * @param n - Number of characters
	 * @returns ANSI escape sequence to move cursor back
	 */
	back: (n: number) => `\u001B[${n}D`,
	clearLine: '\u001B[K',
	clearScreen: '\u001B[2J',
	home: '\u001B[H',
} as const

/**
 * Strip all ANSI escape codes from a string
 * @param str - The string to clean
 * @returns String with all ANSI codes removed
 */
export function stripAnsi(str: string): string {
	// oxlint-disable-next-line no-control-regex
	return str.replaceAll(/\u001B\[[0-9;]*[a-zA-Z]/g, '')
}
