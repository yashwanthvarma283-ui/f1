import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const profileDir = 'F:\\F1\\.edge-audit-profile'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getWebSocketUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9224/json/list')
      if (res.ok) {
        const list = await res.json()
        const page = list.find((item) => item.type === 'page' && item.url.includes('4173'))
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl
        }
        if (list.length > 0 && !page) {
          try {
            const newRes = await fetch('http://127.0.0.1:9224/json/new?http://127.0.0.1:4173/')
            if (newRes.ok) {
              const newPage = await newRes.json()
              if (newPage.webSocketDebuggerUrl) return newPage.webSocketDebuggerUrl
            }
          } catch {}
        }
      }
    } catch {}
    await sleep(300)
  }
  throw new Error('Could not connect to Edge DevTools target on port 9224')
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
  console.log('Launching headless Edge on port 9224...')
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--guest',
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

    // Wait until data finishes loading and skeletons settle
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

    await sleep(2500)

    // Load axe-core
    const axeScript = fs.readFileSync('F:/F1/scripts/axe.min.js', 'utf8')

    const axeResultsSummary = {}

    for (const theme of themes) {
      console.log(`\n================ Testing ${theme.toUpperCase()} MODE ================`)

      // Set theme
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

      await sleep(600)

      // Inject and run axe for color-contrast
      await client.send('Runtime.evaluate', {
        expression: axeScript,
      })

      const axeResult = await client.send('Runtime.evaluate', {
        awaitPromise: true,
        returnByValue: true,
        expression: `
          axe.run(document, {
            runOnly: {
              type: 'rule',
              values: ['color-contrast']
            }
          })
        `,
      })

      const violations = axeResult?.result?.value?.violations || []
      const passes = axeResult?.result?.value?.passes || []
      console.log(`Axe color-contrast passes: ${passes.length}`)
      console.log(`Axe color-contrast violations: ${violations.length}`)

      if (violations.length > 0) {
        console.log('Violations detail:', JSON.stringify(violations.map(v => ({
          id: v.id,
          help: v.help,
          nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary }))
        })), null, 2))
      }

      axeResultsSummary[theme] = {
        violationsCount: violations.length,
        passesCount: passes.length,
        violations: violations.map(v => v.help),
      }

      for (const width of widths) {
        const height = width <= 768 ? 950 : 1080
        console.log(`Capturing ${theme} mode at width ${width}px...`)

        await client.send('Emulation.setDeviceMetricsOverride', {
          width,
          height,
          deviceScaleFactor: 1,
          mobile: width <= 768,
        })

        await client.send('Runtime.evaluate', {
          expression: `window.scrollTo(0, 0);`,
        })

        await sleep(500)

        const result = await client.send('Page.captureScreenshot', {
          format: 'png',
        })

        const filePath = path.join(outputDir, `after_screenshot_${width}_${theme}.png`)
        fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'))
        console.log(`Saved screenshot: ${filePath}`)
      }
    }

    fs.writeFileSync('F:/F1/scripts/axe_results.json', JSON.stringify(axeResultsSummary, null, 2))
    console.log('\nAxe results saved to F:/F1/scripts/axe_results.json!')

    client.close()
  } finally {
    edge.kill()
    try {
      fs.rmSync(profileDir, { recursive: true, force: true })
    } catch {}
  }
}

main().catch((err) => {
  console.error('Error running audit and capture:', err)
  process.exit(1)
})
