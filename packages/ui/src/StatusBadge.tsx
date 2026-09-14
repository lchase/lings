export type StatusTone = 'backlog' | 'progress' | 'qa' | 'done' | 'error'

const TONE_VAR: Record<StatusTone, string> = {
  backlog: 'var(--status-backlog)',
  progress: 'var(--status-progress)',
  qa: 'var(--status-qa)',
  done: 'var(--status-done)',
  error: 'var(--status-error)',
}

export type StatusBadgeProps = {
  tone: StatusTone
  label: string
}

// The signature element (.scratch/lings/design/style-guide.md): a signal-lamp
// chip reused for every status-like concept — ticket status, agent session
// status, notification state.
export function StatusBadge({ tone, label }: StatusBadgeProps) {
  const color = TONE_VAR[tone]
  return (
    <span className="lings-badge" style={{ color }}>
      <span className="lings-badge-dot" />
      <span style={{ color: 'var(--ink)' }}>{label}</span>
    </span>
  )
}
