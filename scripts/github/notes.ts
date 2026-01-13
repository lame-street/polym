#!/usr/bin/env bun
/**
 * Release Notes Generator
 *
 * Lists PRs merged to dev since the last release (dev → main merge).
 * Used when creating release PRs.
 *
 * Usage:
 *   bun run util:release-notes
 */
import { $ } from 'bun'

const REPO = 'handlebauer/polym'

async function main() {
	console.log('Fetching merged PRs to dev...\n')

	// Get the date of the last merge to main (last release)
	// Note: gh pr list sorts by creation date by default, so we fetch all
	// merged PRs and sort by mergedAt to find the most recently merged one
	const lastReleaseDate =
		await $`gh pr list --repo ${REPO} --base main --state merged --json mergedAt`
			.json()
			.then((prs: Array<{ mergedAt: string }>) => {
				if (prs.length === 0) return ''
				// Sort by mergedAt descending and take the first
				prs.sort((a, b) => new Date(b.mergedAt).getTime() - new Date(a.mergedAt).getTime())
				return prs[0]?.mergedAt ?? ''
			})
			.catch(() => '')

	// Build the search query
	// Note: GitHub search only supports day granularity, so we use >= to avoid
	// missing PRs merged on the same day as the release (after it occurred).
	// This may include a few PRs from before the release, but missing PRs is worse.
	let searchQuery = 'base:dev'
	if (lastReleaseDate) {
		const date = lastReleaseDate.split('T')[0]
		searchQuery = `base:dev merged:>=${date}`
		console.log(`Last release: ${date}\n`)
	} else {
		console.log('No previous release found, showing recent PRs\n')
	}

	// Get merged PRs to dev since last release
	const prs =
		await $`gh pr list --repo ${REPO} --state merged --search ${searchQuery} --limit 50 --json number,title,url --jq '.[] | "- #\(.number) \(.title)"'`
			.text()
			.then(t => t.trim())

	if (!prs) {
		console.log('No PRs found since last release.')
		return
	}

	const prLines = prs.split('\n').filter(Boolean)
	const prLinks = prLines.map(line => {
		const match = line.match(/#(\d+)/)
		return match ? `- https://github.com/${REPO}/pull/${match[1]}` : line
	})

	const releaseDate = new Date().toISOString().slice(0, 10)

	console.log('─'.repeat(60))
	console.log('\nPR Title:')
	console.log('```')
	console.log(`Release: ${releaseDate}`)
	console.log('```')
	console.log('\nPR Body:')
	console.log('```markdown')
	console.log('## Summary')
	console.log('')
	console.log('[Write 2-3 sentences about the most important changes]')
	console.log('')
	console.log('### Changes')
	console.log('')
	console.log('- [Brief bullet describing change]')
	console.log('- [Another change]')
	console.log('')
	console.log('## PRs Included')
	console.log('')
	for (const link of prLinks) {
		console.log(link)
	}
	console.log('```')
	console.log('\n' + '─'.repeat(60))
	console.log('\nPRs with titles (for context):')
	for (const line of prLines) {
		console.log(line)
	}
}

await main().catch(console.error)
