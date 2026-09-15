import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      features: { websocket: true },
      // Nitro's dev route scanner only walks scanDirs (default: none) for
      // its own `routes/` file convention — it doesn't fall back to
      // rootDir the way the production build does. Needed so
      // apps/web/routes/fleet.ts (the WS handler) is actually registered.
      scanDirs: ['.'],
      rollupConfig: { external: [/^@sentry\//] },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
