import { stdout } from 'node:process'

import {
	cancel as clackCancel,
	intro as clackIntro,
	log as clackLog,
	outro as clackOutro,
} from '@clack/prompts'
import { bgWhite, black, blueBright, dim, green, greenBright, red } from 'colorette'

/**
 * Whether the terminal supports interactive features (cursor movement).
 * Falls back to false in non-TTY environments (CI, piped output, etc.)
 */
export const isInteractive = stdout.isTTY ?? false

/**
 * Log utilities from clack.
 */
export const log = clackLog

/**
 * Cancel utility from clack.
 */
export const cancel = clackCancel

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

/**
 * Show a styled intro banner.
 *
 * @param title - The title to display (default: 'polym')
 */
export function intro(title = 'polym'): void {
	console.log()
	clackIntro(bgWhite(black(` ${title} `)))
}

/**
 * Styled outro messages for consistent CLI output.
 */
export const outro = {
	/**
	 * Show success outro.
	 *
	 * @param message - Success message to display
	 * @returns void
	 */
	success: (message = 'Done') => clackOutro(green(message)),

	/**
	 * Show cancelled outro.
	 *
	 * @returns void
	 */
	cancelled: () => clackOutro(dim('Cancelled')),

	/**
	 * Show error outro.
	 *
	 * @param message - Error message to display
	 * @returns void
	 */
	error: (message: string) => clackOutro(red(message)),

	/**
	 * Show info outro.
	 *
	 * @param message - Info message to display
	 * @returns void
	 */
	info: (message: string) => clackOutro(dim(message)),
}

/**
 * Inline text highlighting utilities.
 */
export const hl = {
	/**
	 * Highlight a variable/key name (green).
	 *
	 * @param text - Text to highlight
	 * @returns void
	 */
	key: (text: string) => greenBright(text),

	/**
	 * Highlight a path/file name (blue).
	 *
	 * @param text - Text to highlight
	 * @returns void
	 */
	path: (text: string) => blueBright(text),
}
