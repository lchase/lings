import type { InferSelectModel } from 'drizzle-orm'
import type { folders } from '@lings/db'

type Folder = InferSelectModel<typeof folders>

// Ticket view is scoped to a folder plus all of its descendants (see
// .scratch/lings/issues/03-folders-and-tickets.md). Computed in-memory over
// the full folder list rather than a recursive SQL CTE — fine at this app's
// scale, and keeps the query layer simple.
export function descendantFolderIds(all: Folder[], rootId: string): string[] {
  const childrenByParent = new Map<string, string[]>()
  for (const folder of all) {
    if (!folder.parentId) continue
    const siblings = childrenByParent.get(folder.parentId) ?? []
    siblings.push(folder.id)
    childrenByParent.set(folder.parentId, siblings)
  }

  const result: string[] = [rootId]
  const queue = [rootId]
  while (queue.length > 0) {
    const current = queue.shift() as string
    for (const childId of childrenByParent.get(current) ?? []) {
      result.push(childId)
      queue.push(childId)
    }
  }
  return result
}
