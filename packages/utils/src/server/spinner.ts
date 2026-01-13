import { stdout } from 'node:process'

import { blue, green, red } from 'colorette'

import { cursor, isInteractive, stripAnsi } from './terminal'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SPINNER_FRAMES = [
	0x280b, 0x2819, 0x2839, 0x2838, 0x283c, 0x2834, 0x2826, 0x2827, 0x2807, 0x280f,
].map(code => String.fromCodePoint(code))

const SPINNER_INTERVAL = 80
const CHECK_MARK = '\u2714' // ✔
const CROSS_MARK = '\u2716' // ✖

const STATUS_LABELS = {
	pending: '[PENDING]',
	running: '[RUNNING]',
	success: '[SUCCESS]',
	error: '[ERROR]',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TaskStatus = 'pending' | 'running' | 'success' | 'error'

interface TaskState {
	text: string
	status: TaskStatus
	finalText?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multi-task terminal spinner with progress indicators.
 */
export class Spinner {
	private tasks = new Map<string, TaskState>()
	private frameIndex = 0
	private intervalId: ReturnType<typeof setInterval> | null = null
	private previousLineCount = 0
	private printedTasks = new Set<string>()

	constructor(taskIds: string[], texts: string[]) {
		for (const [index, id] of taskIds.entries()) {
			this.tasks.set(id, {
				text: texts[index] ?? '',
				status: 'pending',
			})
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	// Public API
	// ─────────────────────────────────────────────────────────────────────────

	start(): void {
		if (!isInteractive) return

		stdout.write(cursor.hide)
		this.render()
		this.intervalId = setInterval(() => {
			this.frameIndex = (this.frameIndex + 1) % SPINNER_FRAMES.length
			this.render()
		}, SPINNER_INTERVAL)
	}

	updateTask(taskId: string, status: TaskStatus, finalText?: string): void {
		const task = this.tasks.get(taskId)
		if (!task) return

		task.status = status
		if (finalText) task.finalText = finalText

		if (!isInteractive) {
			this.renderNonInteractive(taskId, task)
		}
	}

	stop(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId)
			this.intervalId = null
		}

		if (isInteractive) {
			this.render()
			stdout.write(cursor.show)
		}
	}

	/**
	 * Clear all spinner lines and return cursor to original position.
	 * Use this when you want the spinner to disappear without a trace.
	 */
	clear(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId)
			this.intervalId = null
		}

		if (isInteractive && this.previousLineCount > 0) {
			stdout.write(cursor.up(this.previousLineCount))
			for (let i = 0; i < this.previousLineCount; i++) {
				stdout.write(`\r${cursor.clearLine}\n`)
			}
			stdout.write(cursor.up(this.previousLineCount))
			stdout.write(cursor.show)
		}

		this.previousLineCount = 0
	}

	// ─────────────────────────────────────────────────────────────────────────
	// Rendering (Interactive)
	// ─────────────────────────────────────────────────────────────────────────

	private render(): void {
		if (this.previousLineCount > 0) {
			stdout.write(cursor.up(this.previousLineCount))
		}

		const spinner = SPINNER_FRAMES[this.frameIndex]
		const visibleTasks = [...this.tasks.values()].filter(t => t.status !== 'pending')

		for (const task of visibleTasks) {
			stdout.write(`\r${cursor.clearLine}`)
			console.log(this.formatLine(task, spinner))
		}

		this.previousLineCount = visibleTasks.length
	}

	private formatLine(task: TaskState, spinner?: string): string {
		switch (task.status) {
			case 'running':
				return `${blue(spinner ?? '○')} ${task.text}`
			case 'success':
				return `${green(CHECK_MARK)} ${task.finalText ?? task.text}`
			case 'error':
				return `${red(CROSS_MARK)} Failed: ${task.text}`
			default:
				return task.text
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	// Rendering (Non-Interactive / CI)
	// ─────────────────────────────────────────────────────────────────────────

	private renderNonInteractive(taskId: string, task: TaskState): void {
		const key = `${taskId}-${task.status}`
		if (this.printedTasks.has(key)) return
		this.printedTasks.add(key)

		const text = task.status === 'success' ? (task.finalText ?? task.text) : task.text
		console.log(`${STATUS_LABELS[task.status]} ${stripAnsi(text)}`)
	}
}
