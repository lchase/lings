import { describe, expect, it } from 'vitest'
import { resolveEffectiveLawsDoc } from './laws-resolution'

type Folder = { id: string; parentId: string | null }
type LawsDoc = { id: string; folderId: string | null; content: string }

function folder(id: string, parentId: string | null): Folder {
  return { id, parentId }
}
function doc(id: string, folderId: string | null, content: string): LawsDoc {
  return { id, folderId, content }
}

describe('resolveEffectiveLawsDoc', () => {
  // root -> child -> grandchild
  const folders: Folder[] = [
    folder('root', null),
    folder('child', 'root'),
    folder('grandchild', 'child'),
  ]

  it('returns the folder\'s own doc when it has one', () => {
    const docs = [doc('d1', 'grandchild', 'own rules')]
    const result = resolveEffectiveLawsDoc(folders as any, docs as any, 'grandchild')
    expect(result).toEqual({
      doc: docs[0],
      source: 'folder',
      sourceFolderId: 'grandchild',
    })
  })

  it('walks up to the nearest ancestor with a doc', () => {
    const docs = [doc('d1', 'root', 'root rules')]
    const result = resolveEffectiveLawsDoc(folders as any, docs as any, 'grandchild')
    expect(result).toEqual({
      doc: docs[0],
      source: 'folder',
      sourceFolderId: 'root',
    })
  })

  it('prefers the nearer ancestor over a farther one', () => {
    const docs = [
      doc('d-root', 'root', 'root rules'),
      doc('d-child', 'child', 'child rules'),
    ]
    const result = resolveEffectiveLawsDoc(folders as any, docs as any, 'grandchild')
    expect(result.doc).toBe(docs[1])
    expect(result.sourceFolderId).toBe('child')
  })

  it('prefers a folder-scoped doc over the global doc even when both exist', () => {
    const docs = [
      doc('d-grandchild', 'grandchild', 'grandchild rules'),
      doc('d-global', null, 'global rules'),
    ]
    const result = resolveEffectiveLawsDoc(folders as any, docs as any, 'grandchild')
    expect(result).toEqual({
      doc: docs[0],
      source: 'folder',
      sourceFolderId: 'grandchild',
    })
  })

  it('falls back to the global doc when no ancestor has one', () => {
    const docs = [doc('d-global', null, 'global rules')]
    const result = resolveEffectiveLawsDoc(folders as any, docs as any, 'grandchild')
    expect(result).toEqual({ doc: docs[0], source: 'global', sourceFolderId: null })
  })

  it('returns none when no doc exists anywhere in the ancestry or globally', () => {
    const result = resolveEffectiveLawsDoc(folders as any, [], 'grandchild')
    expect(result).toEqual({ doc: null, source: 'none', sourceFolderId: null })
  })

  it('resolves a root folder directly against the global doc', () => {
    const docs = [doc('d-global', null, 'global rules')]
    const result = resolveEffectiveLawsDoc(folders as any, docs as any, 'root')
    expect(result).toEqual({ doc: docs[0], source: 'global', sourceFolderId: null })
  })
})
