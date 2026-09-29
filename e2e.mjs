import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9333
const URL = 'http://localhost:5173/'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\TEMP\\opencode\\e2eprof',
    `--remote-debugging-port=${PORT}`,
    '--remote-allow-origins=*',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

let ws
const pending = new Map()
let msgId = 0
const consoleErrors = []

function send(method, params = {}) {
  const id = ++msgId
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((res, rej) => {
    pending.set(id, { res, rej })
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id)
        rej(new Error(`timeout: ${method}`))
      }
    }, 20000)
  })
}

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails, null, 2))
  return r.result?.value
}

async function waitFor(expression, label, tries = 40) {
  for (let i = 0; i < tries; i++) {
    const v = await evaluate(expression)
    if (v) return v
    await sleep(150)
  }
  throw new Error(`timeout waiting for: ${label}`)
}

let failures = 0
const check = (cond, label) => {
  if (cond) console.log(`  OK   ${label}`)
  else {
    failures++
    console.log(`  FAIL ${label}`)
  }
}

try {
  let targets
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      targets = await r.json()
      if (targets.length) break
    } catch {
      /* retry */
    }
    await sleep(250)
  }
  const page = targets.find((t) => t.type === 'page')
  if (!page) throw new Error('no page target')

  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = rej
  })
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id)
      pending.delete(m.id)
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)
    } else if (m.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(JSON.stringify(m.params.exceptionDetails))
    } else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      consoleErrors.push(m.params.entry.text)
    }
  }

  await send('Runtime.enable')
  await send('Log.enable')
  await send('Page.enable')
  await send('Page.navigate', { url: URL })
  await waitFor(`document.querySelector('.hero h1') !== null`, 'home hero')

  console.log('\n[1] HOME')
  check((await evaluate(`document.querySelector('.hero h1').innerText`)).includes('Find your way'), 'hero headline')
  check(await evaluate(`document.querySelectorAll('.mapview').length >= 1`), 'campus map preview present')
  check(await evaluate(`!!document.querySelector('.next-class')`), 'My Next Class card')
  check(await evaluate(`!!document.querySelector('.demo-pill')`), 'prototype/demo indicator')
  check(await evaluate(`!!document.querySelector('.ai-fab')`), 'Ask KKW AI button')
  check(await evaluate(`document.querySelectorAll('.marker').length > 10`), 'map markers rendered')

  console.log('\n[2] SEARCH')
  const searchInput = `document.querySelector('.hero .searchbar input')`
  await evaluate(`(()=>{const i=${searchInput};const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'Library');i.dispatchEvent(new Event('input',{bubbles:true}));i.focus();return true})()`)
  await waitFor(`document.querySelectorAll('.search-results .search-result').length > 0`, 'search results')
  const firstResult = await evaluate(`document.querySelector('.search-result .result-name').textContent`)
  check(firstResult === 'Library', `search "Library" first result = ${firstResult}`)
  await evaluate(`document.querySelector('.search-result').click()`)
  await waitFor(`document.querySelector('.loc-name') !== null`, 'location panel after search pick')
  const picked = await evaluate(`document.querySelector('.loc-name').textContent`)
  check(picked === 'Library', `panel opened for ${picked}`)

  console.log('\n[3] FLOOR SELECTOR')
  await evaluate(`[...document.querySelectorAll('.floor-btn')].find(b=>b.textContent==='1').click()`)
  await sleep(300)
  check(await evaluate(`[...document.querySelectorAll('.floor-btn')].find(b=>b.dataset.active==='true').textContent === '1'`), 'floor 1 active')
  check((await evaluate(`document.querySelector('.floor-caption').textContent`)) === 'First Floor', 'floor caption updated')

  console.log('\n[4] MARKER + LOCATION PANEL')
  await evaluate(`[...document.querySelectorAll('.floor-btn')].find(b=>b.textContent==='G').click()`)
  await sleep(300)
  await evaluate(`document.querySelectorAll('.room')[0].dispatchEvent(new MouseEvent('click',{bubbles:true}))`)
  await waitFor(`document.querySelector('.loc-name') !== null`, 'room selected')
  check(await evaluate(`document.querySelectorAll('.loc-cell').length === 4`), 'building / floor / room / type cells')
  check((await evaluate(`document.querySelector('.tag-demo').textContent.toLowerCase()`)).includes('demo location'), 'DEMO LOCATION badge')

  console.log('\n[5] NAVIGATION MODE')
  await evaluate(`[...document.querySelectorAll('.panel-actions .btn')].find(b=>b.textContent.includes('Navigate Here')).click()`)
  await waitFor(`document.querySelector('.steps') !== null`, 'navigation steps')
  const stepCount = await evaluate(`document.querySelectorAll('.steps .step').length`)
  check(stepCount > 0, `steps rendered (${stepCount})`)
  check((await evaluate(`document.body.innerText.toLowerCase()`)).includes('demo route'), 'Demo route badge shown')
  check(await evaluate(`document.body.innerText.includes('Exit Navigation')`), 'Exit Navigation control')
  check(await evaluate(`document.querySelectorAll('.route-seg').length > 0`), 'route drawn on map')
  await evaluate(`document.querySelectorAll('.steps .step')[2].click()`)
  await sleep(300)
  check(await evaluate(`[...document.querySelectorAll('.steps .step')].some(s=>s.dataset.active==='true')`), 'active step highlight')
  await evaluate(`[...document.querySelectorAll('.nav-footer .btn')].find(b=>b.textContent.includes('Exit')).click()`)
  await sleep(300)
  check(await evaluate(`document.querySelector('.steps') === null`), 'navigation exited')

  console.log('\n[6] AI ASSISTANT')
  await evaluate(`document.querySelector('.ai-fab').click()`)
  await waitFor(`document.querySelector('.ai-panel') !== null`, 'AI panel opens')
  await evaluate(`(()=>{const i=document.querySelector('.ai-input input');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'Where is the introduction hall?');i.dispatchEvent(new Event('input',{bubbles:true}));return true})()`)
  await evaluate(`document.querySelector('.ai-input').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`)
  await waitFor(`document.querySelectorAll('.msg').length >= 3`, 'AI replied', 60)
  const aiText = await evaluate(`[...document.querySelectorAll('.msg.ai')].pop().textContent`)
  check(aiText.includes('Introduction Hall'), 'AI located the Introduction Hall')
  check(await evaluate(`[...document.querySelectorAll('.msg.ai')].pop().innerText.includes('Show on Map')`), 'Show on Map action')
  check(await evaluate(`[...document.querySelectorAll('.msg.ai')].pop().innerText.includes('Navigate')`), 'Navigate action')

  console.log('\n[7] NAVIGATION + DIRECTORY VIEWS')
  await evaluate(`[...document.querySelectorAll('.msg.ai')].pop().querySelector('.btn-primary').click()`)
  await sleep(600)
  check(await evaluate(`document.querySelector('.mapview') !== null && document.querySelector('.mapview').classList.contains('full')`), 'switched to full map with route')
  check(await evaluate(`document.querySelectorAll('.route-seg').length > 0`), 'route visible')
  await evaluate(`[...document.querySelectorAll('.nav-btn')].find(b=>b.textContent==='Directory').click()`)
  await waitFor(`document.querySelector('.dir-list') !== null`, 'directory page')
  const cards = await evaluate(`document.querySelectorAll('.dir-card').length`)
  check(cards > 20, `directory cards (${cards})`)
  await evaluate(`[...document.querySelectorAll('.dir-chip')].find(c=>c.textContent==='Labs').click()`)
  await sleep(250)
  const labCards = await evaluate(`document.querySelectorAll('.dir-card').length`)
  check(labCards > 0 && labCards < cards, `category filter Labs (${labCards} of ${cards})`)

  console.log('\n[8] THEME + MOBILE LAYOUT')
  await evaluate(`document.querySelector('[aria-label="Toggle theme"]').click()`)
  await sleep(250)
  check(await evaluate(`document.documentElement.dataset.theme === 'light'`), 'light theme toggled')
  await evaluate(`document.querySelector('[aria-label="Toggle theme"]').click()`)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  })
  await evaluate(`[...document.querySelectorAll('.nav-btn')].find(b=>b.textContent==='Campus Map').click()`)
  await sleep(600)
  check(await evaluate(`document.querySelector('.mapview') !== null`), 'map renders on mobile viewport')
  check(await evaluate(`getComputedStyle(document.querySelector('.floor-selector')).flexDirection.includes('row')`), 'floor selector reflowed for mobile')
  await send('Emulation.clearDeviceMetricsOverride')

  console.log('\n[9] CONSOLE ERRORS')
  check(consoleErrors.length === 0, consoleErrors.length ? `errors: ${consoleErrors.join(' | ')}` : 'no runtime/console errors')
} catch (e) {
  failures++
  console.error('\n[EXCEPTION]', e)
} finally {
  try {
    ws?.close()
  } catch {
    /* ignore */
  }
  chrome.kill()
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
