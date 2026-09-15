import { QueryClient } from '@tanstack/react-query'

// Single shared client-side cache — the WS hook patches into this via
// setQueryData (see ws-cache.ts).
export const queryClient = new QueryClient()
