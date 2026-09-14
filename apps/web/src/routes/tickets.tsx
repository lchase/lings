import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
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
        className="flex items-center gap-1 rounded px-1 py-0.5"
        style={{ paddingLeft: depth * 16 }}
      >
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-4 text-xs"
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
          className={`rounded px-2 py-0.5 text-sm ${isSelected ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
        >
          {folder ? folder.name : 'All folders'}
        </button>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="ml-1 text-xs text-gray-500 hover:underline"
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
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            className="rounded border px-2 py-0.5 text-sm"
          />
          <button type="submit" className="rounded border px-2 py-0.5 text-sm">
            Add
          </button>
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border px-3 py-2 text-sm"
      >
        + New ticket
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-col gap-2 rounded border p-3"
    >
      <input
        required
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="rounded border px-2 py-1 text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="rounded border px-2 py-1 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TicketStatus)}
          className="rounded border px-2 py-1 text-sm"
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-black px-3 py-1.5 text-sm text-white"
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
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
      <tr className="border-t">
        <td className="p-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm"
          />
        </td>
        <td className="p-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus)}
            className="rounded border px-2 py-1 text-sm"
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </td>
        <td className="p-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          />
        </td>
        <td className="p-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          />
        </td>
        <td className="p-2">
          <button
            onClick={handleSave}
            className="mr-2 rounded border px-2 py-1 text-xs"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded border px-2 py-1 text-xs"
          >
            Cancel
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr
      className="cursor-pointer border-t hover:bg-gray-50"
      onClick={() => setEditing(true)}
    >
      <td className="p-2">{ticket.title}</td>
      <td className="p-2">{STATUS_LABEL[ticket.status]}</td>
      <td className="p-2">{ticket.startDate?.slice(0, 10) ?? '—'}</td>
      <td className="p-2">{ticket.dueDate?.slice(0, 10) ?? '—'}</td>
      <td className="p-2 text-xs text-gray-400">click to edit</td>
    </tr>
  )
}

function TicketsPage() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [folders, setFolders] = useState<Folder[] | null>(null)
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

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

  const selectedFolderName = useMemo(() => {
    if (!selectedFolderId || !folders) return 'All folders'
    return folders.find((f) => f.id === selectedFolderId)?.name ?? 'All folders'
  }, [folders, selectedFolderId])

  if (!authed || !folders) {
    return (
      <main className="page-wrap px-4 py-14">
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main className="page-wrap flex gap-8 px-4 py-14">
      <aside className="w-64 flex-shrink-0">
        <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">
          Folders
        </h2>
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
        <h1 className="mb-1 text-2xl font-bold">{selectedFolderName}</h1>
        <p className="mb-4 text-sm text-gray-500">
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

        {tickets === null ? (
          <p>Loading tickets…</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-gray-500">No tickets here yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="p-2">Title</th>
                <th className="p-2">Status</th>
                <th className="p-2">Start</th>
                <th className="p-2">Due</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  onUpdated={(updated) =>
                    setTickets((prev) =>
                      (prev ?? []).map((x) =>
                        x.id === updated.id ? updated : x,
                      ),
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
