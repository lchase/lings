import { defineConfig } from 'vitest/config'

// Deliberately separate from vite.config.ts: that config loads nitro/SSR
// plugins meant for the app server, which aren't needed for unit tests and
// hang on shutdown under vitest.
export default defineConfig({
  test: {
    environment: 'node',
  },
})
