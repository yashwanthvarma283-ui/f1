import { spawn } from 'child_process'
import fs from 'fs'

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const profileDir = 'F:\\F1\\.edge-verify-profile'

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

async function inspectAtWidth(width, theme = 'dark') {
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9227',
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
        const res = await fetch('http://127.0.0.1:9227/json/list')
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

    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: width < 768,
    })

    // Set theme
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('pitwall_theme_mode', '${theme}');
          if ('${theme}' === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        })()
      `,
    })

    // Wait for skeletons to resolve and content to render
    for (let i = 0; i < 50; i++) {
      const evalRes = await client.send('Runtime.evaluate', {
        expression: `!document.querySelector('.skeleton-shimmer') && document.querySelectorAll('h1').length > 0`,
      })
      if (evalRes?.result?.value === true) break
      await sleep(300)
    }

    // Give 500ms for animations and layout to settle
    await sleep(600)

    const verification = await client.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          // 1. Race name mapping
          const latestResultH2 = document.querySelector('section:nth-of-type(2) h2')?.textContent.trim() || '';
          const seasonCards = Array.from(document.querySelectorAll('a[href*="/race/"]')).map(a => {
            const h3 = a.querySelector('h3');
            const roundSpan = a.querySelector('span.font-mono');
            return {
              round: roundSpan ? roundSpan.textContent.trim() : '',
              title: h3 ? h3.textContent.trim() : ''
            };
          });
          const round16 = seasonCards.find(c => c.round.includes('16'));

          // 2. Headings letter spacing
          const h2s = Array.from(document.querySelectorAll('h2')).map(h => ({
            text: h.textContent.trim(),
            letterSpacing: window.getComputedStyle(h).letterSpacing
          }));
          const maxName = Array.from(document.querySelectorAll('*')).find(el => el.textContent.includes('VERSTAPPEN') && el.tagName.startsWith('H') || el.classList?.contains('font-display'));
          const maxLs = maxName ? window.getComputedStyle(maxName).letterSpacing : '';

          // 3. Hero balance: left col and right col bottom coordinates
          const leftCol = Array.from(document.querySelectorAll('*')).find(el => el.className && typeof el.className === 'string' && el.className.includes('lg:col-span-7'));
          const rightCol = Array.from(document.querySelectorAll('*')).find(el => el.className && typeof el.className === 'string' && el.className.includes('lg:col-span-5'));
          const leftRect = leftCol ? leftCol.getBoundingClientRect() : null;
          const rightRect = rightCol ? rightCol.getBoundingClientRect() : null;

          // 4. Flags for Antonelli, Hadjar, Leclerc
          const findFlag = (driverName) => {
            const elements = Array.from(document.querySelectorAll('*'));
            const el = elements.find(e => e.children.length === 0 && e.textContent.includes(driverName));
            if (!el) return null;
            const parent = el.closest('button, div, tr');
            const svg = parent ? parent.querySelector('svg') : null;
            const textNodes = parent ? parent.textContent : '';
            return {
              driverName,
              hasSvg: !!svg,
              hasDash: textNodes.includes('–'),
            };
          };

          const flags = [
            findFlag('Antonelli'),
            findFlag('Hadjar'),
            findFlag('Leclerc'),
            findFlag('Verstappen')
          ];

          // 5. Podium cards: borders and top accent
          const podiumCards = Array.from(document.querySelectorAll('section:nth-of-type(2) .group.relative')).map((card, i) => {
            const computed = window.getComputedStyle(card);
            const topBar = card.querySelector('div.absolute.top-0');
            const badge = card.querySelector('span.font-mono');
            return {
              position: i + 1,
              borderColor: computed.borderColor,
              topBarBg: topBar ? window.getComputedStyle(topBar).backgroundColor : '',
              badgeText: badge ? badge.textContent.trim() : ''
            };
          });

          // 6. Standings horizontal points bar
          const standingsBars = Array.from(document.querySelectorAll('section:nth-of-type(3) .rounded-full .h-full')).map(bar => {
            const computed = window.getComputedStyle(bar);
            const parent = bar.parentElement;
            const gap = parent ? parent.nextElementSibling?.textContent.trim() : '';
            return {
              width: bar.style.width,
              bg: computed.backgroundColor,
              transformOrigin: computed.transformOrigin,
              gap
            };
          });

          return {
            width: ${width},
            theme: '${theme}',
            latestResultH2,
            round16,
            h2s,
            maxLs,
            heroBalance: {
              leftBottom: leftRect ? Math.round(leftRect.bottom) : null,
              rightBottom: rightRect ? Math.round(rightRect.bottom) : null,
              diff: leftRect && rightRect ? Math.round(Math.abs(leftRect.bottom - rightRect.bottom)) : null
            },
            flags,
            podiumCards,
            standingsBarsCount: standingsBars.length,
            sampleStandingsBar: standingsBars[0]
          };
        })()
      `,
    })

    client.close()
    if (verification.exceptionDetails) {
      console.error('CDP eval exception:', verification.exceptionDetails)
    }
    return verification.result?.value
  } finally {
    edge.kill()
    try { fs.rmSync(profileDir, { recursive: true, force: true }) } catch {}
  }
}

async function main() {
  console.log('--- Verifying at 1280px (Dark) ---')
  const dark1280 = await inspectAtWidth(1280, 'dark')
  console.log(JSON.stringify(dark1280, null, 2))

  console.log('\n--- Verifying at 1920px (Dark) ---')
  const dark1920 = await inspectAtWidth(1920, 'dark')
  console.log(JSON.stringify(dark1920.heroBalance, null, 2))

  console.log('\n--- Verifying at 1280px (Light) ---')
  const light1280 = await inspectAtWidth(1280, 'light')
  console.log('Light 1280 latestResultH2:', light1280.latestResultH2)
  console.log('Light 1280 round16:', light1280.round16)
  console.log('Light 1280 heroBalance:', light1280.heroBalance)
}

main().catch(console.error)
