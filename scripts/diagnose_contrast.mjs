import { spawn } from 'child_process'
import fs from 'fs'

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const profileDir = 'F:\\F1\\.edge-diag-profile'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function getWebSocketUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9225/json/list')
      if (res.ok) {
        const list = await res.json()
        const page = list.find((item) => item.type === 'page' && item.url.includes('4173'))
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
        if (list.length > 0 && !page) {
          const newRes = await fetch('http://127.0.0.1:9225/json/new?http://127.0.0.1:4173/')
          const newPage = await newRes.json()
          if (newPage.webSocketDebuggerUrl) return newPage.webSocketDebuggerUrl
        }
      }
    } catch {}
    await sleep(200)
  }
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl)
    this.id = 1
    this.callbacks = new Map()
    this.ready = new Promise((r) => { this.ws.onopen = () => r() })
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id)
        this.callbacks.delete(msg.id)
        if (msg.error) reject(msg.error)
        else resolve(msg.result)
      }
    }
  }
  async send(method, params = {}) {
    await this.ready
    const id = this.id++
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  close() { this.ws.close() }
}

async function main() {
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--no-first-run',
    '--disable-sync',
    '--guest',
    `--user-data-dir=${profileDir}`,
    'http://127.0.0.1:4173/',
  ])

  try {
    const wsUrl = await getWebSocketUrl()
    const client = new CDPClient(wsUrl)
    await client.send('Page.enable')
    await client.send('Runtime.enable')

    const axeScript = fs.readFileSync('F:/F1/scripts/axe.min.js', 'utf8')
    await sleep(2500)

    for (const theme of ['dark', 'light']) {
      console.log(`\n================ ${theme.toUpperCase()} ================`)
      await client.send('Runtime.evaluate', {
        expression: `
          if ('${theme}' === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('pitwall_theme_mode', JSON.stringify('dark'));
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('pitwall_theme_mode', JSON.stringify('light'));
          }
        `,
      })
      await sleep(500)

      await client.send('Runtime.evaluate', { expression: axeScript })
      const res = await client.send('Runtime.evaluate', {
        awaitPromise: true,
        returnByValue: true,
        expression: `axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } })`,
      })

      const violations = res?.result?.value?.violations?.[0]?.nodes || []
      console.log(`Found ${violations.length} violations:`)
      for (const v of violations) {
        console.log('Target:', v.target.join(' > '))
        console.log('Failure:', v.failureSummary.replace(/\n/g, ' '))
        console.log('HTML snippet:', v.html)
        console.log('---')
      }
    }

    client.close()
  } finally {
    edge.kill()
    try { fs.rmSync(profileDir, { recursive: true, force: true }) } catch {}
  }
}

main().catch(console.error)
