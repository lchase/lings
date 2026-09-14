import { createFileRoute } from '@tanstack/react-router'
import { eq, inArray } from 'drizzle-orm'
import { folders, tickets, TICKET_STATUSES } from '@lings/db'
import type { TicketStatus } from '@lings/db'
import { db } from '../../lib/db'
import { requireUser } from '../../lib/require-user'
import { descendantFolderIds } from '../../lib/folder-tree'

function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export const Route = createFileRoute('/api/tickets')({
  server: {
    handlers: {
      // Scoped to a folder and all its descendants; omit folderId for the
      // whole tree (see .scratch/lings/issues/03-folders-and-tickets.md).
      GET: async ({ request }: { request: Request }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const folderId = new URL(request.url).searchParams.get('folderId')
        if (!folderId) {
          const all = await db.select().from(tickets)
          return Response.json({ tickets: all })
        }

        const allFolders = await db.select().from(folders)
        if (!allFolders.some((f) => f.id === folderId)) {
          return Response.json({ error: 'folder not found' }, { status: 404 })
        }
        const scope = descendantFolderIds(allFolders, folderId)
        const scoped = await db
          .select()
          .from(tickets)
          .where(inArray(tickets.folderId, scope))
        return Response.json({ tickets: scoped })
      },
      POST: async ({ request }: { request: Request }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const body = await request.json()
        const title = typeof body.title === 'string' ? body.title.trim() : ''
        const folderId = typeof body.folderId === 'string' ? body.folderId : ''
        const description =
          typeof body.description === 'string' ? body.description : null
        const status: TicketStatus = TICKET_STATUSES.includes(body.status)
          ? body.status
          : 'backlog'
        const startDate = parseDate(body.startDate) ?? null
        const dueDate = parseDate(body.dueDate) ?? null

        if (!title) {
          return Response.json({ error: 'title is required' }, { status: 400 })
        }
        if (!folderId) {
          return Response.json(
            { error: 'folderId is required' },
            { status: 400 },
          )
        }
        const folderRows = await db
          .select({ id: folders.id })
          .from(folders)
          .where(eq(folders.id, folderId))
        if (folderRows.length === 0) {
          return Response.json({ error: 'folderId not found' }, { status: 400 })
        }

        const [created] = await db
          .insert(tickets)
          .values({
            id: crypto.randomUUID(),
            folderId,
            title,
            description,
            status,
            startDate,
            dueDate,
          })
          .returning()

        return Response.json({ ticket: created }, { status: 201 })
      },
    },
  },
})
