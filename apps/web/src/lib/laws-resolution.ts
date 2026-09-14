import type { InferSelectModel } from 'drizzle-orm'
import type { folders, lawsDocs } from '@lings/db'

type Folder = InferSelectModel<typeof folders>
type LawsDoc = InferSelectModel<typeof lawsDocs>

export type LawsResolution =
  | { doc: LawsDoc; source: 'folder'; sourceFolderId: string }
  | { doc: LawsDoc; source: 'global'; sourceFolderId: null }
  | { doc: null; source: 'none'; sourceFolderId: null }

// Nearest-ancestor resolution: walk from `folderId` up through parentId
// toward root, returning the first folder-scoped doc found; fall back to the
// global (folderId = null) doc; otherwise no doc applies
// (see .scratch/lings/issues/06-laws-and-permissions.md).
export function resolveEffectiveLawsDoc(
  allFolders: Folder[],
  allDocs: LawsDoc[],
  folderId: string,
): LawsResolution {
  const foldersById = new Map(allFolders.map((f) => [f.id, f]))
  const docsByFolderId = new Map(
    allDocs.filter((d) => d.folderId !== null).map((d) => [d.folderId, d]),
  )
  const globalDoc = allDocs.find((d) => d.folderId === null) ?? null

  const visited = new Set<string>()
  let currentId: string | null = folderId
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId)
    const doc = docsByFolderId.get(currentId)
    if (doc) return { doc, source: 'folder', sourceFolderId: currentId }
    currentId = foldersById.get(currentId)?.parentId ?? null
  }

  if (globalDoc) return { doc: globalDoc, source: 'global', sourceFolderId: null }
  return { doc: null, source: 'none', sourceFolderId: null }
}
