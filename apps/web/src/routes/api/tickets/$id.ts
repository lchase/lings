import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { folders, tickets, TICKET_STATUSES } from '@lings/db'
import { db } from '../../../lib/db'
import { requireUser } from '../../../lib/require-user'

function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export const Route = createFileRoute('/api/tickets/$id')({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request
        params: { id: string }
      }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const rows = await db
          .select()
          .from(tickets)
          .where(eq(tickets.id, params.id))
        if (rows.length === 0) {
          return Response.json({ error: 'not found' }, { status: 404 })
        }
        return Response.json({ ticket: rows[0] })
      },
      PATCH: async ({
        request,
        params,
      }: {
        request: Request
        params: { id: string }
      }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const existingRows = await db
          .select({ id: tickets.id })
          .from(tickets)
          .where(eq(tickets.id, params.id))
        if (existingRows.length === 0) {
          return Response.json({ error: 'not found' }, { status: 404 })
        }

        const body = await request.json()
        const patch: Partial<typeof tickets.$inferInsert> = {}

        if (typeof body.title === 'string') {
          const title = body.title.trim()
          if (!title) {
            return Response.json(
              { error: 'title cannot be empty' },
              { status: 400 },
            )
          }
          patch.title = title
        }
        if (typeof body.description === 'string' || body.description === null) {
          patch.description = body.description
        }
        if (body.status !== undefined) {
          if (!TICKET_STATUSES.includes(body.status)) {
            return Response.json({ error: 'invalid status' }, { status: 400 })
          }
          patch.status = body.status
        }
        if (body.folderId !== undefined) {
          if (typeof body.folderId !== 'string' || !body.folderId) {
            return Response.json({ error: 'invalid folderId' }, { status: 400 })
          }
          const folderRows = await db
            .select({ id: folders.id })
            .from(folders)
            .where(eq(folders.id, body.folderId))
          if (folderRows.length === 0) {
            return Response.json(
              { error: 'folderId not found' },
              { status: 400 },
            )
          }
          patch.folderId = body.folderId
        }
        if ('startDate' in body) {
          const startDate = parseDate(body.startDate)
          if (startDate !== undefined) patch.startDate = startDate
        }
        if ('dueDate' in body) {
          const dueDate = parseDate(body.dueDate)
          if (dueDate !== undefined) patch.dueDate = dueDate
        }

        const [updated] = await db
          .update(tickets)
          .set(patch)
          .where(eq(tickets.id, params.id))
          .returning()

        return Response.json({ ticket: updated })
      },
    },
  },
})
