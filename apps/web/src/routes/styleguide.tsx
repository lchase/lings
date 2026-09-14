import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  StatusBadge,
  Table,
  Textarea,
} from '@lings/ui'
import type { AlertTone, StatusTone } from '@lings/ui'

export const Route = createFileRoute('/styleguide')({
  component: StyleGuidePage,
})

const COLOR_SWATCHES: Array<{ name: string; varName: string }> = [
  { name: 'ink', varName: '--ink' },
  { name: 'ink-soft', varName: '--ink-soft' },
  { name: 'paper', varName: '--paper' },
  { name: 'panel', varName: '--panel' },
  { name: 'wire', varName: '--wire' },
  { name: 'signal', varName: '--signal' },
]

const STATUS_SWATCHES: Array<{ label: string; tone: StatusTone }> = [
  { label: 'Backlog', tone: 'backlog' },
  { label: 'In progress', tone: 'progress' },
  { label: 'QA / waiting', tone: 'qa' },
  { label: 'Done', tone: 'done' },
  { label: 'Error', tone: 'error' },
]

const ALERT_TONES: Array<{ tone: AlertTone; title: string; body: string }> = [
  {
    tone: 'info',
    title: 'Heads up',
    body: 'Scheduled runs are attributed to the playbook creator, not whoever triggers them.',
  },
  {
    tone: 'warning',
    title: 'Approaching spend cap',
    body: 'This session has used 82% of its budget. It will halt to waiting-approval past the cap.',
  },
  {
    tone: 'error',
    title: 'Session failed',
    body: 'The agent-call step exited non-zero. Check the run log for the stderr output.',
  },
  {
    tone: 'success',
    title: 'Playbook published',
    body: 'Version 4 is now the active version for new runs.',
  },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-12">
      <h2 className="display-title mb-1 text-xl font-bold text-[var(--ink)]">
        {title}
      </h2>
      {description && (
        <p className="mb-4 max-w-2xl text-sm text-[var(--ink-soft)]">
          {description}
        </p>
      )}
      {!description && <div className="mb-4" />}
      {children}
    </section>
  )
}

function StyleGuidePage() {
  const [selectValue, setSelectValue] = useState('backlog')

  return (
    <main className="page-wrap px-4 py-14">
      <div className="island-shell rise-in mb-12 rounded-lg px-6 py-10 sm:px-10 sm:py-14">
        <p className="island-kicker mb-3">
          Internal reference — not user-facing
        </p>
        <h1 className="display-title mb-4 max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight text-[var(--ink)] sm:text-5xl">
          Lings component &amp; state reference
        </h1>
        <p className="max-w-2xl text-base text-[var(--ink-soft)]">
          Every primitive from <code>@lings/ui</code>, rendered live against the
          current theme tokens. See{' '}
          <code>.scratch/lings/design/style-guide.md</code> for the written
          guide this page proves out. Toggle light/dark in the header to check
          both.
        </p>
      </div>

      <Section
        title="Color"
        description="Brand neutrals + the one purple accent (left), and the status set used by StatusBadge (right) — a deliberately separate hue family so status never reads as a tint of the brand color."
      >
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="grid grid-cols-3 gap-3">
            {COLOR_SWATCHES.map((c) => (
              <div key={c.name}>
                <div
                  className="mb-1 h-14 rounded-[var(--radius-control)] border border-[var(--wire)]"
                  style={{ background: `var(${c.varName})` }}
                />
                <p className="font-mono text-xs text-[var(--ink-soft)]">
                  {c.name}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {STATUS_SWATCHES.map((s) => (
              <div key={s.tone}>
                <div
                  className="mb-1 h-14 rounded-[var(--radius-control)] border border-[var(--wire)]"
                  style={{ background: `var(--status-${s.tone})` }}
                />
                <p className="font-mono text-xs text-[var(--ink-soft)]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Type"
        description="IBM Plex Sans for body/UI, IBM Plex Mono for anything that's data rather than prose."
      >
        <Card className="flex flex-col gap-3">
          <h1 className="display-title text-3xl font-bold text-[var(--ink)]">
            Heading — Plex Sans 700
          </h1>
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Subheading — Plex Sans 600
          </h2>
          <p className="text-sm text-[var(--ink-soft)]">
            Body text — Plex Sans 400. Used for descriptions, prose, anything
            meant to be read rather than scanned.
          </p>
          <p className="font-mono text-xs tracking-wide text-[var(--ink-soft)] uppercase">
            Mono label — Plex Mono 600, uppercase, 0.04em tracking
          </p>
          <p className="font-mono text-sm text-[var(--ink)]">
            ticket_a1b2c3 · 2026-09-14T03:34:08Z · exit 0
          </p>
        </Card>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>
            Primary (disabled)
          </Button>
          <Button variant="secondary" disabled>
            Secondary (disabled)
          </Button>
        </div>
      </Section>

      <Section title="Form fields">
        <Card className="flex max-w-sm flex-col gap-3">
          <Input placeholder="Input — empty" />
          <Input defaultValue="Input — filled" />
          <Select
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
          >
            <option value="backlog">Select — Backlog</option>
            <option value="in_progress">Select — In progress</option>
          </Select>
          <Textarea placeholder="Textarea — empty" />
          <Input placeholder="Disabled" disabled />
        </Card>
      </Section>

      <Section
        title="Status badges"
        description="The signature element — reused for ticket status now, agent session status and notification state later."
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="backlog" label="Backlog" />
          <StatusBadge tone="progress" label="In Progress" />
          <StatusBadge tone="qa" label="QA" />
          <StatusBadge tone="done" label="Done" />
          <StatusBadge tone="error" label="Error" />
        </div>
      </Section>

      <Section
        title="Alerts"
        description="Tinted background + a colored dot, not a fully saturated block — body text stays neutral and readable regardless of tone."
      >
        <div className="flex flex-col gap-3">
          {ALERT_TONES.map((a) => (
            <Alert key={a.tone} tone={a.tone} title={a.title}>
              {a.body}
            </Alert>
          ))}
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-sm">
          <p className="mb-1 font-mono text-xs tracking-wide text-[var(--ink-soft)] uppercase">
            Session #4471
          </p>
          <p className="text-sm text-[var(--ink)]">
            Flat panel, 1px wire border, no shadow at rest — the base container
            every card-shaped thing in the app uses.
          </p>
        </Card>
      </Section>

      <Section title="Table">
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-medium text-[var(--ink)]">
                Fix login race condition
              </td>
              <td>
                <StatusBadge tone="progress" label="In Progress" />
              </td>
              <td className="font-mono text-xs text-[var(--ink-soft)]">
                2026-09-20
              </td>
            </tr>
            <tr>
              <td className="font-medium text-[var(--ink)]">Write API docs</td>
              <td>
                <StatusBadge tone="backlog" label="Backlog" />
              </td>
              <td className="font-mono text-xs text-[var(--ink-soft)]">—</td>
            </tr>
          </tbody>
        </Table>
      </Section>

      <Section
        title="Empty state"
        description="No dedicated component — plain muted text, left-aligned with whatever it's replacing. Kept deliberately quiet rather than an illustration/CTA block; this is a dense internal tool, not a marketing empty state."
      >
        <Card className="max-w-sm">
          <p className="text-sm text-[var(--ink-soft)]">No tickets here yet.</p>
        </Card>
      </Section>
    </main>
  )
}
