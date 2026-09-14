import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Input,
  Select,
  StatusBadge,
  Table,
  Textarea,
} from '@lings/ui'
import type { StatusTone } from '@lings/ui'
import { getStoredAuthToken } from '../lib/auth-client'

export const Route = createFileRoute('/tickets')({ component: TicketsPage })

type Folder = { id: string; name: string; parentId: string | null }
type TicketStatus = 'backlog' | 'in_progress' | 'qa' | 'done'
type Ticket = {
  id: string
  folderId: string
  title: string
  description: string | null
  status: TicketStatus
  startDate: string | null
  dueDate: string | null
}

const STATUS_LABEL: Record<TicketStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  qa: 'QA',
  done: 'Done',
}

const STATUS_TONE: Record<TicketStatus, StatusTone> = {
  backlog: 'backlog',
  in_progress: 'progress',
  qa: 'qa',
  done: 'done',
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${getStoredAuthToken()}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  return res
}

type FolderNodeProps = {
  folder: Folder | null // null = the implicit root ("All")
  allFolders: Folder[]
  depth: number
  selectedFolderId: string | null
  onSelect: (id: string | null) => void
  onCreated: (folder: Folder) => void
}

function FolderNode({
  folder,
  allFolders,
  depth,
  selectedFolderId,
  onSelect,
  onCreated,
}: FolderNodeProps) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [expanded, setExpanded] = useState(true)

  const children = allFolders.filter((f) => f.parentId === (folder?.id ?? null))
  const isSelected = selectedFolderId === (folder?.id ?? null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const res = await api('/api/folders', {
      method: 'POST',
      body: JSON.stringify({ name: trimmed, parentId: folder?.id ?? null }),
    })
    if (res.ok) {
      const { folder: created } = await res.json()
      onCreated(created)
      setName('')
      setAdding(false)
      setExpanded(true)
    }
  }

  return (
    <li>
      <div
        className="flex items-center gap-1 rounded-[var(--radius-control)] px-1 py-0.5"
        style={{ paddingLeft: depth * 16 }}
      >
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-4 text-xs text-[var(--ink-soft)]"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <button
          type="button"
          onClick={() => onSelect(folder?.id ?? null)}
          className={`rounded-[var(--radius-control)] px-2 py-0.5 font-mono text-sm ${
            isSelected
              ? 'bg-[var(--signal)] text-white'
              : 'text-[var(--ink)] hover:bg-[var(--panel)]'
          }`}
        >
          {folder ? folder.name : 'All folders'}
        </button>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="ml-1 text-xs text-[var(--ink-soft)] hover:text-[var(--signal)] hover:underline"
        >
          + subfolder
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="flex gap-1 py-1"
          style={{ paddingLeft: (depth + 1) * 16 + 16 }}
        >
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
          />
          <Button type="submit" variant="secondary">
            Add
          </Button>
        </form>
      )}

      {expanded && children.length > 0 && (
        <ul>
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              allFolders={allFolders}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onCreated={onCreated}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function NewTicketForm({
  folderId,
  onCreated,
}: {
  folderId: string
  onCreated: (t: Ticket) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TicketStatus>('backlog')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await api('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        folderId,
        title,
        description: description || null,
        status,
        startDate: startDate || null,
        dueDate: dueDate || null,
      }),
    })
    if (res.ok) {
      const { ticket } = await res.json()
      onCreated(ticket)
      setTitle('')
      setDescription('')
      setStatus('backlog')
      setStartDate('')
      setDueDate('')
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        + New ticket
      </Button>
    )
  }

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full"
        />
        <div className="flex flex-wrap gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus)}
            className="w-auto"
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto"
          />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-auto"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            Create
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

const STATUS_ORDER: TicketStatus[] = ['backlog', 'in_progress', 'qa', 'done']

type ViewName = 'table' | 'kanban' | 'gantt' | 'list'

const VIEW_LABEL: Record<ViewName, string> = {
  table: 'Table',
  kanban: 'Kanban',
  gantt: 'Gantt',
  list: 'List',
}

function ViewTabs({
  view,
  onChange,
}: {
  view: ViewName
  onChange: (v: ViewName) => void
}) {
  return (
    <div className="mb-4 inline-flex rounded-[var(--radius-control)] border border-[var(--wire)] p-0.5">
      {(Object.keys(VIEW_LABEL) as ViewName[]).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-[calc(var(--radius-control)-2px)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.04em] ${
            view === v
              ? 'bg-[var(--signal)] text-white'
              : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
          }`}
        >
          {VIEW_LABEL[v]}
        </button>
      ))}
    </div>
  )
}

function KanbanCard({
  ticket,
  onDragStart,
}: {
  ticket: Ticket
  onDragStart: (e: React.DragEvent, ticket: Ticket) => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket)}
      className="cursor-grab rounded-[var(--radius-control)] border border-[var(--wire)] bg-[var(--panel)] p-2 active:cursor-grabbing"
    >
      <p className="text-sm font-medium text-[var(--ink)]">{ticket.title}</p>
      <p className="mt-1 font-mono text-xs text-[var(--ink-soft)]">
        {ticket.startDate?.slice(0, 10) ?? '—'} →{' '}
        {ticket.dueDate?.slice(0, 10) ?? '—'}
      </p>
    </div>
  )
}

// Native HTML5 drag-and-drop — no extra dependency needed for a single
// board with four columns (see .scratch/lings/issues/05-ticket-views.md).
function KanbanBoard({
  tickets,
  onUpdated,
}: {
  tickets: Ticket[]
  onUpdated: (t: Ticket) => void
}) {
  const [dragOverStatus, setDragOverStatus] = useState<TicketStatus | null>(
    null,
  )

  function handleDragStart(e: React.DragEvent, ticket: Ticket) {
    e.dataTransfer.setData('text/plain', ticket.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  async function handleDrop(e: React.DragEvent, status: TicketStatus) {
    e.preventDefault()
    setDragOverStatus(null)
    const id = e.dataTransfer.getData('text/plain')
    const ticket = tickets.find((t) => t.id === id)
    if (!ticket || ticket.status === status) return
    const res = await api(`/api/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const { ticket: updated } = await res.json()
      onUpdated(updated)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STATUS_ORDER.map((status) => (
        <div
          key={status}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOverStatus(status)
          }}
          onDragLeave={() =>
            setDragOverStatus((s) => (s === status ? null : s))
          }
          onDrop={(e) => handleDrop(e, status)}
          className={`min-h-[8rem] rounded-[var(--radius-panel)] border p-2 ${
            dragOverStatus === status
              ? 'border-[var(--signal)] bg-[var(--signal-soft)]'
              : 'border-[var(--wire)] bg-[var(--paper)]'
          }`}
        >
          <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-[var(--ink-soft)]">
            {STATUS_LABEL[status]}
          </h3>
          <div className="flex flex-col gap-2">
            {tickets
              .filter((t) => t.status === status)
              .map((t) => (
                <KanbanCard
                  key={t.id}
                  ticket={t}
                  onDragStart={handleDragStart}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function GanttChart({ tickets }: { tickets: Ticket[] }) {
  const scheduled = tickets.filter((t) => t.startDate && t.dueDate)
  const range = useMemo(() => {
    if (scheduled.length === 0) return null
    const starts = scheduled.map((t) => new Date(t.startDate!).getTime())
    const ends = scheduled.map((t) => new Date(t.dueDate!).getTime())
    const min = Math.min(...starts)
    const max = Math.max(...ends)
    return { min, max: Math.max(max, min + 24 * 60 * 60 * 1000) }
  }, [scheduled])

  return (
    <div className="flex flex-col gap-1">
      {tickets.map((t) => {
        const hasBothDates = t.startDate && t.dueDate
        const left =
          hasBothDates && range
            ? ((new Date(t.startDate!).getTime() - range.min) /
                (range.max - range.min)) *
              100
            : 0
        const width =
          hasBothDates && range
            ? Math.max(
                ((new Date(t.dueDate!).getTime() -
                  new Date(t.startDate!).getTime()) /
                  (range.max - range.min)) *
                  100,
                2,
              )
            : 0

        return (
          <div key={t.id} className="flex items-center gap-3">
            <div className="w-40 flex-shrink-0 truncate text-sm text-[var(--ink)]">
              {t.title}
            </div>
            <div className="relative h-6 flex-1 rounded-[var(--radius-control)] bg-[var(--paper)]">
              {hasBothDates ? (
                <div
                  className="absolute top-0.5 h-5 rounded-[var(--radius-control)]"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: `var(--status-${
                      t.status === 'in_progress' ? 'progress' : t.status
                    })`,
                  }}
                  title={`${t.startDate?.slice(0, 10)} → ${t.dueDate?.slice(0, 10)}`}
                />
              ) : (
                <div className="flex h-full items-center px-2 font-mono text-xs text-[var(--ink-soft)]">
                  No dates set
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ListView({
  tickets,
  onUpdated,
}: {
  tickets: Ticket[]
  onUpdated: (t: Ticket) => void
}) {
  async function cycleStatus(t: Ticket) {
    const next =
      STATUS_ORDER[(STATUS_ORDER.indexOf(t.status) + 1) % STATUS_ORDER.length]
    const res = await api(`/api/tickets/${t.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) {
      const { ticket: updated } = await res.json()
      onUpdated(updated)
    }
  }

  return (
    <ul className="divide-y divide-[var(--wire)] rounded-[var(--radius-panel)] border border-[var(--wire)]">
      {tickets.map((t) => (
        <li
          key={t.id}
          className="flex items-center gap-3 px-3 py-1.5 hover:bg-[var(--signal-soft)]"
        >
          <button
            type="button"
            onClick={() => cycleStatus(t)}
            title="Click to advance status"
          >
            <StatusBadge tone={STATUS_TONE[t.status]} label={STATUS_LABEL[t.status]} />
          </button>
          <span className="min-w-0 flex-1 truncate text-sm text-[var(--ink)]">
            {t.title}
          </span>
          <span className="flex-shrink-0 font-mono text-xs text-[var(--ink-soft)]">
            {t.startDate?.slice(0, 10) ?? '—'} → {t.dueDate?.slice(0, 10) ?? '—'}
          </span>
        </li>
      ))}
    </ul>
  )
}

function TicketRow({
  ticket,
  onUpdated,
}: {
  ticket: Ticket
  onUpdated: (t: Ticket) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(ticket.title)
  const [status, setStatus] = useState(ticket.status)
  const [startDate, setStartDate] = useState(
    ticket.startDate?.slice(0, 10) ?? '',
  )
  const [dueDate, setDueDate] = useState(ticket.dueDate?.slice(0, 10) ?? '')

  async function handleSave() {
    const res = await api(`/api/tickets/${ticket.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title,
        status,
        startDate: startDate || null,
        dueDate: dueDate || null,
      }),
    })
    if (res.ok) {
      const { ticket: updated } = await res.json()
      onUpdated(updated)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <tr>
        <td>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
        </td>
        <td>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus)}
            className="w-auto"
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </td>
        <td>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto"
          />
        </td>
        <td>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-auto"
          />
        </td>
        <td className="whitespace-nowrap">
          <Button variant="primary" onClick={handleSave} className="mr-2">
            Save
          </Button>
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="cursor-pointer" onClick={() => setEditing(true)}>
      <td className="font-medium text-[var(--ink)]">{ticket.title}</td>
      <td>
        <StatusBadge
          tone={STATUS_TONE[ticket.status]}
          label={STATUS_LABEL[ticket.status]}
        />
      </td>
      <td className="font-mono text-xs text-[var(--ink-soft)]">
        {ticket.startDate?.slice(0, 10) ?? '—'}
      </td>
      <td className="font-mono text-xs text-[var(--ink-soft)]">
        {ticket.dueDate?.slice(0, 10) ?? '—'}
      </td>
      <td className="text-xs text-[var(--ink-soft)]">edit</td>
    </tr>
  )
}

function TicketsPage() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [folders, setFolders] = useState<Folder[] | null>(null)
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [view, setView] = useState<ViewName>('table')

  useEffect(() => {
    api('/api/folders').then(async (res) => {
      if (res.status === 401) {
        navigate({ to: '/login' })
        return
      }
      const data: { folders: Folder[] } = await res.json()
      setFolders(data.folders)
      setAuthed(true)
    })
  }, [navigate])

  useEffect(() => {
    if (!authed) return
    const query = selectedFolderId ? `?folderId=${selectedFolderId}` : ''
    api(`/api/tickets${query}`).then(async (res) => {
      const data: { tickets: Ticket[] } = await res.json()
      setTickets(data.tickets)
    })
  }, [authed, selectedFolderId])

  // Shared by every view (table/kanban/gantt/list) so a status change made
  // in one view is reflected in the others immediately, no reload needed
  // (see .scratch/lings/issues/05-ticket-views.md).
  function handleTicketUpdated(updated: Ticket) {
    setTickets((prev) =>
      (prev ?? []).map((x) => (x.id === updated.id ? updated : x)),
    )
  }

  const selectedFolderName = useMemo(() => {
    if (!selectedFolderId || !folders) return 'All folders'
    return folders.find((f) => f.id === selectedFolderId)?.name ?? 'All folders'
  }, [folders, selectedFolderId])

  if (!authed || !folders) {
    return (
      <main className="page-wrap px-4 py-14 text-[var(--ink-soft)]">
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main className="page-wrap flex gap-8 px-4 py-14">
      <aside className="w-64 flex-shrink-0">
        <h2 className="island-kicker mb-2">Folders</h2>
        <ul>
          <FolderNode
            folder={null}
            allFolders={folders}
            depth={0}
            selectedFolderId={selectedFolderId}
            onSelect={setSelectedFolderId}
            onCreated={(f) => setFolders((prev) => [...(prev ?? []), f])}
          />
        </ul>
      </aside>

      <section className="min-w-0 flex-1">
        <h1 className="display-title mb-1 text-2xl font-bold text-[var(--ink)]">
          {selectedFolderName}
        </h1>
        <p className="mb-4 text-sm text-[var(--ink-soft)]">
          {selectedFolderId
            ? 'Tickets in this folder and its subfolders.'
            : 'Tickets across the whole tree.'}
        </p>

        {selectedFolderId && (
          <div className="mb-4">
            <NewTicketForm
              folderId={selectedFolderId}
              onCreated={(t) => setTickets((prev) => [...(prev ?? []), t])}
            />
          </div>
        )}

        <ViewTabs view={view} onChange={setView} />

        {tickets === null ? (
          <p className="text-sm text-[var(--ink-soft)]">Loading tickets…</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">No tickets here yet.</p>
        ) : view === 'table' ? (
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Start</th>
                <th>Due</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <TicketRow key={t.id} ticket={t} onUpdated={handleTicketUpdated} />
              ))}
            </tbody>
          </Table>
        ) : view === 'kanban' ? (
          <KanbanBoard tickets={tickets} onUpdated={handleTicketUpdated} />
        ) : view === 'gantt' ? (
          <GanttChart tickets={tickets} />
        ) : (
          <ListView tickets={tickets} onUpdated={handleTicketUpdated} />
        )}
      </section>
    </main>
  )
}
