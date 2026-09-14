import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { folders, lawsDocs } from '@lings/db'
import { db } from '../../../lib/db'
import { requireUser } from '../../../lib/require-user'
import { resolveEffectiveLawsDoc } from '../../../lib/laws-resolution'

// Resolves the effective laws doc for a folder by walking up its ancestors,
// falling back to the global doc (see
// .scratch/lings/issues/06-laws-and-permissions.md).
export const Route = createFileRoute('/api/laws-docs/effective')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const folderId = new URL(request.url).searchParams.get('folderId')
        if (!folderId) {
          return Response.json({ error: 'folderId is required' }, { status: 400 })
        }

        const folderRows = await db
          .select({ id: folders.id })
          .from(folders)
          .where(eq(folders.id, folderId))
        if (folderRows.length === 0) {
          return Response.json({ error: 'folder not found' }, { status: 404 })
        }

        const [allFolders, allDocs] = await Promise.all([
          db.select().from(folders),
          db.select().from(lawsDocs),
        ])

        const resolution = resolveEffectiveLawsDoc(allFolders, allDocs, folderId)
        return Response.json(resolution)
      },
    },
  },
})
