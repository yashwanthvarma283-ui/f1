import { spawn } from 'child_process'
import fs from 'fs'

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const profileDir = 'F:\\F1\\.edge-data-profile'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
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
    '--remote-debugging-port=9226',
    '--disable-gpu',
    '--no-first-run',
    '--disable-sync',
    '--guest',
    `--user-data-dir=${profileDir}`,
    'http://127.0.0.1:4173/',
  ])

  try {
    let wsUrl
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch('http://127.0.0.1:9226/json/list')
        const list = await res.json()
        const page = list.find((item) => item.type === 'page' && item.url.includes('4173'))
        if (page?.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl
          break
        }
      } catch {}
      await sleep(200)
    }

    const client = new CDPClient(wsUrl)
    await client.send('Page.enable')
    await client.send('Runtime.enable')

    for (let i = 0; i < 40; i++) {
      const evalRes = await client.send('Runtime.evaluate', {
        expression: `!document.querySelector('.skeleton-shimmer') && document.querySelectorAll('h1').length > 0`,
      })
      if (evalRes?.result?.value === true) break
      await sleep(400)
    }

    const res = await client.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          // Look at cards in season strip and latest result header
          const headings = Array.from(document.querySelectorAll('h2, h3')).map(h => h.textContent.trim());
          const seasonCards = Array.from(document.querySelectorAll('a[href*="/race/"]')).map(a => {
            const h3 = a.querySelector('h3');
            const p = a.querySelector('p');
            return {
              href: a.getAttribute('href'),
              title: h3 ? h3.textContent.trim() : '',
              circuit: p ? p.textContent.trim() : ''
            };
          });

          // Check if there is react-query cache in window
          return { headings, seasonCards: seasonCards.slice(0, 25) };
        })()
      `,
    })

    console.log(JSON.stringify(res.result.value, null, 2))
    client.close()
  } finally {
    edge.kill()
    try { fs.rmSync(profileDir, { recursive: true, force: true }) } catch {}
  }
}

main().catch(console.error)
