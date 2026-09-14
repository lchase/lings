import { createFileRoute } from '@tanstack/react-router'
import { eq, isNull } from 'drizzle-orm'
import { folders, lawsDocs } from '@lings/db'
import { db } from '../../lib/db'
import { requireUser } from '../../lib/require-user'

// A laws doc scoped to a specific folder, or the global doc when folderId is
// omitted (see .scratch/lings/issues/06-laws-and-permissions.md). GET/PUT
// operate on the doc that lives exactly at that scope — for the nearest-
// ancestor-resolved doc, see /api/laws-docs/effective.
export const Route = createFileRoute('/api/laws-docs')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const folderId = new URL(request.url).searchParams.get('folderId')
        const rows = await db
          .select()
          .from(lawsDocs)
          .where(folderId ? eq(lawsDocs.folderId, folderId) : isNull(lawsDocs.folderId))
        return Response.json({ doc: rows[0] ?? null })
      },
      PUT: async ({ request }: { request: Request }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const body = await request.json()
        const folderId =
          typeof body.folderId === 'string' && body.folderId ? body.folderId : null
        const content = typeof body.content === 'string' ? body.content : ''

        if (folderId) {
          const folderRows = await db
            .select({ id: folders.id })
            .from(folders)
            .where(eq(folders.id, folderId))
          if (folderRows.length === 0) {
            return Response.json({ error: 'folderId not found' }, { status: 400 })
          }
        }

        // select-then-branch isn't atomic on its own; run it inside a
        // transaction so sqlite's write lock serializes concurrent upserts
        // to the same scope instead of both branches racing to insert.
        const { doc, created } = await db.transaction(async (tx) => {
          const existing = await tx
            .select({ id: lawsDocs.id })
            .from(lawsDocs)
            .where(folderId ? eq(lawsDocs.folderId, folderId) : isNull(lawsDocs.folderId))

          if (existing.length > 0) {
            const [updated] = await tx
              .update(lawsDocs)
              .set({ content })
              .where(eq(lawsDocs.id, existing[0].id))
              .returning()
            return { doc: updated, created: false }
          }

          const [inserted] = await tx
            .insert(lawsDocs)
            .values({ id: crypto.randomUUID(), folderId, content })
            .returning()
          return { doc: inserted, created: true }
        })

        return Response.json({ doc }, { status: created ? 201 : 200 })
      },
    },
  },
})
