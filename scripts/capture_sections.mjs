import { spawn } from 'child_process'
import fs from 'fs'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--disable-gpu',
    '--no-first-run',
    '--guest',
    '--user-data-dir=F:\\F1\\.edge-audit-profile4',
    'http://127.0.0.1:4173/'
  ])

  await sleep(2000)
  const res = await fetch('http://127.0.0.1:9227/json/list')
  const list = await res.json()
  const page = list.find((p) => p.type === 'page' && p.url.includes('4173'))
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))

  let id = 1
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const curId = id++
      const handler = (e) => {
        const msg = JSON.parse(e.data)
        if (msg.id === curId) {
          ws.removeEventListener('message', handler)
          resolve(msg.result)
        }
      }
      ws.addEventListener('message', handler)
      ws.send(JSON.stringify({ id: curId, method, params }))
    })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  })

  // Wait for data
  console.log('Waiting for data...')
  for (let i = 0; i < 40; i++) {
    const evalRes = await send('Runtime.evaluate', {
      expression: '!document.querySelector(".skeleton-shimmer") && document.querySelectorAll("h2").length > 1'
    })
    if (evalRes?.result?.value === true) break
    await sleep(300)
  }
  await sleep(2500)

  // 1. Scroll to Latest Result & Standings
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 820);' })
  await sleep(600)
  let snap = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('F:\\F1\\screenshots\\section_results_and_standings.png', Buffer.from(snap.data, 'base64'))

  // 2. Scroll to Standings Table & Season rounds
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1400);' })
  await sleep(600)
  snap = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('F:\\F1\\screenshots\\section_standings_and_rounds.png', Buffer.from(snap.data, 'base64'))

  // 3. Switch to Light Mode and capture Standings
  await send('Runtime.evaluate', {
    expression: `
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pitwall_theme_mode', JSON.stringify('light'));
      window.scrollTo(0, 1400);
    `
  })
  await sleep(600)
  snap = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('F:\\F1\\screenshots\\section_standings_light.png', Buffer.from(snap.data, 'base64'))

  // 4. Scroll to Quick Driver Lookup in light mode
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 2100);' })
  await sleep(600)
  snap = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync('F:\\F1\\screenshots\\section_drivers_light.png', Buffer.from(snap.data, 'base64'))

  console.log('Finished capturing section screenshots!')
  ws.close()
  edge.kill()
}

main().catch(console.error)
