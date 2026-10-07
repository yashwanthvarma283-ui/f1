import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const profileDir = 'F:\\F1\\.edge-test-profile'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getWebSocketUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list')
      if (res.ok) {
        const list = await res.json()
        const page = list.find((item) => item.type === 'page' && item.url.includes('4173'))
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl
        }

        // If no page matching 4173 yet, open one
        if (list.length > 0 && !page) {
          try {
            const newRes = await fetch('http://127.0.0.1:9222/json/new?http://127.0.0.1:4173/')
            if (newRes.ok) {
              const newPage = await newRes.json()
              if (newPage.webSocketDebuggerUrl) return newPage.webSocketDebuggerUrl
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // wait and retry
    }
    await sleep(300)
  }

  throw new Error('Could not connect to Edge DevTools target for 4173')
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl)
    this.id = 1
    this.callbacks = new Map()

    this.ready = new Promise((resolve) => {
      this.ws.onopen = () => resolve()
    })

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
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

  close() {
    this.ws.close()
  }
}

async function main() {
  console.log('Launching headless Edge on port 9222...')
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--guest',
    '--disable-features=Translate,OptimizationHints,MediaRouter',
    `--user-data-dir=${profileDir}`,
    'http://127.0.0.1:4173/',
  ])

  try {
    const wsUrl = await getWebSocketUrl()
    console.log('Connected to CDP at:', wsUrl)
    const client = new CDPClient(wsUrl)

    await client.send('Page.enable')
    await client.send('Runtime.enable')

    const widths = [375, 768, 1280, 1920]
    const themes = ['dark', 'light']

    const outputDir = 'F:\\F1\\screenshots'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Wait until data finishes loading and skeletons are gone
    console.log('Waiting for data to load and skeletons to settle...')
    for (let i = 0; i < 40; i++) {
      const evalRes = await client.send('Runtime.evaluate', {
        expression: `!document.querySelector('.skeleton-shimmer') && document.querySelectorAll('h1').length > 0`,
      })
      if (evalRes?.result?.value === true) {
        console.log('Page data is fully rendered!')
        break
      }
      await sleep(300)
    }

    // Extra sleep to let track animations and numbers settle
    await sleep(2000)

    for (const theme of themes) {
      // Toggle theme in DOM and persist
      await client.send('Runtime.evaluate', {
        expression: `
          if ('${theme}' === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('pitwall_theme_mode', JSON.stringify('dark'));
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('pitwall_theme_mode', JSON.stringify('light'));
          }
          window.scrollTo(0, 0);
        `,
      })

      // Wait a moment for styles to apply
      await sleep(500)

      for (const width of widths) {
        const height = width <= 768 ? 950 : 1080
        console.log(`Capturing ${theme} mode at width ${width}px...`)

        // Set device metrics
        await client.send('Emulation.setDeviceMetricsOverride', {
          width,
          height,
          deviceScaleFactor: 1,
          mobile: width <= 768,
        })

        // Ensure window scroll is at top
        await client.send('Runtime.evaluate', {
          expression: `window.scrollTo(0, 0);`,
        })

        await sleep(500)

        // Capture screenshot
        const result = await client.send('Page.captureScreenshot', {
          format: 'png',
        })

        const filePath = path.join(outputDir, `screenshot_${width}_${theme}.png`)
        fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'))
        console.log(`Saved screenshot: ${filePath}`)
      }
    }

    client.close()
    console.log('All screenshots captured successfully!')
  } finally {
    edge.kill()
    try {
      fs.rmSync(profileDir, { recursive: true, force: true })
    } catch {
      // ignore
    }
  }
}

main().catch((err) => {
  console.error('Error taking screenshots:', err)
  process.exit(1)
})
