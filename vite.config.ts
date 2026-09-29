import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages serves this project from a sub-directory:
 *   https://aryan-shelar.github.io/kkw-campus-navigator/
 *
 * `vite dev` (and the e2e/smoke suites) stay at `/`,
 * `vite build` + `vite preview` emit/read the sub-directory base.
 */
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'development' ? '/' : '/kkw-campus-navigator/',
  server: { host: true, port: 5173, strictPort: false },
}))
