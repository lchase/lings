import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Textarea } from '@lings/ui'
import { getStoredAuthToken } from '../lib/auth-client'

export const Route = createFileRoute('/laws')({ component: LawsPage })

type Folder = { id: string; name: string; parentId: string | null }
type LawsDoc = { id: string; folderId: string | null; content: string }
type Effective =
  | { doc: LawsDoc; source: 'folder'; sourceFolderId: string }
  | { doc: LawsDoc; source: 'global'; sourceFolderId: null }
  | { doc: null; source: 'none'; sourceFolderId: null }

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

function FolderTree({
  folders,
  parentId,
  depth,
  selectedFolderId,
  onSelect,
}: {
  folders: Folder[]
  parentId: string | null
  depth: number
  selectedFolderId: string | null
  onSelect: (id: string | null) => void
}) {
  const children = folders.filter((f) => f.parentId === parentId)
  if (children.length === 0) return null
  return (
    <ul>
      {children.map((f) => (
        <li key={f.id}>
          <button
            type="button"
            onClick={() => onSelect(f.id)}
            style={{ paddingLeft: depth * 16 }}
            className={`w-full truncate rounded-[var(--radius-control)] px-2 py-0.5 text-left font-mono text-sm ${
              selectedFolderId === f.id
                ? 'bg-[var(--signal)] text-white'
                : 'text-[var(--ink)] hover:bg-[var(--panel)]'
            }`}
          >
            {f.name}
          </button>
          <FolderTree
            folders={folders}
            parentId={f.id}
            depth={depth + 1}
            selectedFolderId={selectedFolderId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  )
}

function sourceLabel(
  effective: Effective,
  folders: Folder[],
  selectedFolderId: string | null,
): string {
  if (effective.source === 'none') return 'No laws doc applies'
  if (effective.source === 'global') return 'Global default'
  if (effective.sourceFolderId === selectedFolderId) return 'This folder'
  const name = folders.find((f) => f.id === effective.sourceFolderId)?.name
  return `Inherited from "${name ?? effective.sourceFolderId}"`
}

function LawsEditor({
  folderId,
  folders,
}: {
  folderId: string | null
  folders: Folder[]
}) {
  const [ownDoc, setOwnDoc] = useState<LawsDoc | null | undefined>(undefined)
  const [effective, setEffective] = useState<Effective | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    setOwnDoc(undefined)
    setEffective(null)
    setSaved(false)

    const query = folderId ? `?folderId=${folderId}` : ''
    api(`/api/laws-docs${query}`).then(async (res) => {
      const data: { doc: LawsDoc | null } = await res.json()
      if (cancelled) return
      setOwnDoc(data.doc)
      setContent(data.doc?.content ?? '')
    })

    if (folderId) {
      api(`/api/laws-docs/effective?folderId=${folderId}`).then(async (res) => {
        const data: Effective = await res.json()
        if (cancelled) return
        setEffective(data)
      })
    }

    return () => {
      cancelled = true
    }
  }, [folderId])

  async function handleSave() {
    setSaving(true)
    const res = await api('/api/laws-docs', {
      method: 'PUT',
      body: JSON.stringify({ folderId, content }),
    })
    setSaving(false)
    if (res.ok) {
      const { doc } = await res.json()
      setOwnDoc(doc)
      setSaved(true)
      if (folderId) {
        setEffective({ doc, source: 'folder', sourceFolderId: folderId })
      }
    }
  }

  if (ownDoc === undefined) {
    return <p className="text-sm text-[var(--ink-soft)]">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {effective && (
        <Alert
          tone={effective.source === 'none' ? 'warning' : 'info'}
          title={`Currently effective: ${sourceLabel(effective, folders, folderId)}`}
        >
          {effective.doc ? undefined : 'No folder in this ancestry, and no global default, has a laws doc yet.'}
        </Alert>
      )}

      <Card>
        <p className="island-kicker mb-2">
          {folderId ? 'Doc for this folder' : 'Global default doc'}
        </p>
        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setSaved(false)
          }}
          placeholder="Write this scope's laws in markdown…"
          className="min-h-[16rem] w-full font-mono text-sm"
        />
        <div className="mt-3 flex items-center gap-3">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {saved && (
            <span className="text-sm text-[var(--ink-soft)]">Saved.</span>
          )}
        </div>
      </Card>
    </div>
  )
}

function LawsPage() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [folders, setFolders] = useState<Folder[] | null>(null)
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
        <h2 className="island-kicker mb-2">Scope</h2>
        <ul>
          <li>
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={`w-full truncate rounded-[var(--radius-control)] px-2 py-0.5 text-left font-mono text-sm ${
                selectedFolderId === null
                  ? 'bg-[var(--signal)] text-white'
                  : 'text-[var(--ink)] hover:bg-[var(--panel)]'
              }`}
            >
              Global default
            </button>
          </li>
        </ul>
        <FolderTree
          folders={folders}
          parentId={null}
          depth={0}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
        />
      </aside>

      <section className="min-w-0 flex-1">
        <h1 className="display-title mb-1 text-2xl font-bold text-[var(--ink)]">
          Laws & permissions
        </h1>
        <p className="mb-4 text-sm text-[var(--ink-soft)]">
          {selectedFolderId
            ? 'The nearest ancestor with a doc applies; falls back to the global default.'
            : 'Applies whenever no folder in the ancestry has its own doc.'}
        </p>
        <LawsEditor folderId={selectedFolderId} folders={folders} />
      </section>
    </main>
  )
}
