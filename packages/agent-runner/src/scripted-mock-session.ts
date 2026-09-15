import type { MockAgentHandle } from './mock-agent-runner'

const WORDS = [
  'Reading',
  'the',
  'ticket',
  'spec',
  'and',
  'drafting',
  'a',
  'plan',
  'before',
  'touching',
  'any',
  'files.',
]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Drives a MockAgentHandle through a fixed status/delta/cost script, since
// the mock adapter is otherwise fully passive (see mock-agent-runner.ts).
// Used server-side to give the fleet view something live to watch for a
// started mock session (see .scratch/lings/issues/08-websocket-fleet-view.md).
export async function runScriptedMockSession(
  handle: MockAgentHandle,
  opts: { stepMs?: number } = {},
): Promise<void> {
  const stepMs = opts.stepMs ?? 400

  handle.emitStatus('generating')

  let tokensOut = 0
  for (const word of WORDS) {
    await sleep(stepMs)
    const chunk = `${word} `
    handle.emitDelta(chunk)
    tokensOut += 1
    handle.emitCost({
      tokensIn: 120,
      tokensOut,
      costUsd: 120 * 0.000003 + tokensOut * 0.000015,
      contextPct: Math.min(100, Math.round((tokensOut / WORDS.length) * 20)),
    })
  }

  await sleep(stepMs)
  handle.emitStatus('done')
}
