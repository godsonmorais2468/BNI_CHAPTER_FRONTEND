import type { Poll, Vote } from './types'

/** How many members picked each option, and how many answered at all. */
export function tally(poll: Poll, votes: Vote[]) {
  const mine = votes.filter((v) => v.pollId === poll.id)
  const counts: Record<string, number> = Object.fromEntries(poll.options.map((o) => [o.id, 0]))
  for (const v of mine) for (const id of v.optionIds) if (id in counts) counts[id] += 1
  return { counts, voters: mine.length }
}
