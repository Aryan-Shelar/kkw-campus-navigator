import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let ok = true
try {
  const { CampusProvider } = await server.ssrLoadModule('/src/store.tsx')
  const { Home } = await server.ssrLoadModule('/src/pages/Home.tsx')
  const { MapPage } = await server.ssrLoadModule('/src/pages/MapPage.tsx')
  const { DirectoryPage } = await server.ssrLoadModule('/src/pages/DirectoryPage.tsx')
  const campus = await server.ssrLoadModule('/src/data/campus.ts')
  const graph = await server.ssrLoadModule('/src/data/graph.ts')
  const pathMod = await server.ssrLoadModule('/src/lib/path.ts')
  const search = await server.ssrLoadModule('/src/lib/search.ts')
  const ai = await server.ssrLoadModule('/src/data/assistant.ts')

  const wrap = (el) => React.createElement(CampusProvider, null, el)
  const pages = { Home, MapPage, DirectoryPage }
  for (const [name, P] of Object.entries(pages)) {
    const html = renderToString(wrap(React.createElement(P)))
    console.log(`[ok] ${name} rendered ${html.length} chars`)
  }

  console.log(`[data] locations=${campus.LOCATIONS.length} buildings=${campus.BUILDINGS.length} nodes=${graph.GRAPH_NODES.length} edges=${graph.GRAPH_EDGES.length}`)

  const orphan = campus.LOCATIONS.filter((l) => !graph.NODE_BY_ID[l.nodeId])
  if (orphan.length) {
    ok = false
    console.error('[FAIL] locations without a graph node:', orphan.map((l) => `${l.id}→${l.nodeId}`))
  } else console.log('[ok] every location resolves to a graph node')

  const r = pathMod.buildRoute('main-gate', 'a-aids2')
  if (!r) {
    ok = false
    console.error('[FAIL] no route main-gate → a-aids2')
  } else {
    console.log(`[ok] route main-gate → a-aids2: ${r.steps.length} steps, ${r.nodes.length} nodes`)
    r.steps.forEach((s, i) => console.log(`    ${i + 1}. [${s.floor}] ${s.text}`))
  }

  for (const q of ['AIDS Lab', 'Library', 'Introduction Hall', 'Computer Lab', 'Canteen', 'Administration', 'Main Gate']) {
    const hits = search.searchLocations(q, 3)
    console.log(`[search] "${q}" → ${hits.map((h) => h.location.name).join(', ') || 'NONE'}`)
    if (!hits.length) { ok = false; console.error('  [FAIL] no results') }
  }

  const reply = ai.demoAssistant.reply('Where is the introduction hall?')
  console.log(`[ai] ${reply.text}`)
  if (!reply.locationId) { ok = false; console.error('[FAIL] ai did not resolve introduction hall') }
} catch (e) {
  ok = false
  console.error('[FAIL] runtime error', e)
}

await server.close()
process.exit(ok ? 0 : 1)
