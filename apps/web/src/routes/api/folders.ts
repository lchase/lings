import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { folders } from '@lings/db'
import { db } from '../../lib/db'
import { requireUser } from '../../lib/require-user'

export const Route = createFileRoute('/api/folders')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const all = await db.select().from(folders)
        return Response.json({ folders: all })
      },
      POST: async ({ request }: { request: Request }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const body = await request.json()
        const name = typeof body.name === 'string' ? body.name.trim() : ''
        const parentId =
          typeof body.parentId === 'string' && body.parentId
            ? body.parentId
            : null

        if (!name) {
          return Response.json({ error: 'name is required' }, { status: 400 })
        }
        if (parentId) {
          const parentRows = await db
            .select({ id: folders.id })
            .from(folders)
            .where(eq(folders.id, parentId))
          if (parentRows.length === 0) {
            return Response.json(
              { error: 'parentId not found' },
              { status: 400 },
            )
          }
        }

        const [created] = await db
          .insert(folders)
          .values({ id: crypto.randomUUID(), name, parentId })
          .returning()

        return Response.json({ folder: created }, { status: 201 })
      },
    },
  },
})
