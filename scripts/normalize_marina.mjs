import { spawn } from 'child_process'
import fs from 'fs'

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const profileDir = 'F:\\F1\\.edge-svg-profile'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
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
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-first-run',
    '--disable-sync',
    '--guest',
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ])

  try {
    let wsUrl
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch('http://127.0.0.1:9223/json/list')
        const list = await res.json()
        if (list[0]?.webSocketDebuggerUrl) {
          wsUrl = list[0].webSocketDebuggerUrl
          break
        }
      } catch {}
      await sleep(200)
    }

    const client = new CDPClient(wsUrl)
    await client.send('Page.enable')

    const rawSvg = fs.readFileSync('F:/F1/scripts/marina_bay_raw.svg', 'utf8')
    const result = await client.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          document.body.innerHTML = ${JSON.stringify(rawSvg)};
          const path = document.querySelector('#path4158');
          const b = path.getBBox();
          const bbox = { x: b.x, y: b.y, width: b.width, height: b.height };
          const totalLen = path.getTotalLength();

          // Turns text elements
          const turns = [];
          document.querySelectorAll('text').forEach(t => {
            const num = parseInt(t.textContent.trim(), 10);
            if (!isNaN(num) && num >= 1 && num <= 19) {
              const rect = t.getBBox();
              turns.push({
                num,
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2
              });
            }
          });
          turns.sort((a,b) => a.num - b.num);

          // Sample 150 points along the path for smooth SVG polygon / normalized curve
          const samples = [];
          const step = totalLen / 180;
          for (let l = 0; l <= totalLen; l += step) {
            const pt = path.getPointAtLength(l);
            samples.push({ x: pt.x, y: pt.y });
          }

          return { bbox, totalLen, turns, samples };
        })()
      `,
    })

    const data = result.result.value
    console.log('BBox:', data.bbox)
    console.log('Total Length:', data.totalLen)
    console.log('Turns count:', data.turns.length)

    // Target viewBox: 0 0 500 350
    // Desired inner dimensions: w=440, h=280, marginX=30, marginY=35
    const targetW = 440
    const targetH = 280
    const padX = 30
    const padY = 35

    const scaleX = targetW / data.bbox.width
    const scaleY = targetH / data.bbox.height
    const scale = Math.min(scaleX, scaleY)

    // Center within 500x350
    const finalW = data.bbox.width * scale
    const finalH = data.bbox.height * scale
    const offsetX = padX + (targetW - finalW) / 2 - data.bbox.x * scale
    const offsetY = padY + (targetH - finalH) / 2 - data.bbox.y * scale

    function transformPt(x, y) {
      return {
        x: Math.round((x * scale + offsetX) * 10) / 10,
        y: Math.round((y * scale + offsetY) * 10) / 10,
      }
    }

    // Build normalized SVG path using samples
    const normSamples = data.samples.map(s => transformPt(s.x, s.y))
    let pathD = `M ${normSamples[0].x} ${normSamples[0].y}`
    for (let i = 1; i < normSamples.length; i++) {
      pathD += ` L ${normSamples[i].x} ${normSamples[i].y}`
    }
    pathD += ' Z'

    // Transform turns
    const turnNames = {
      1: 'Turn 1 - Sheares',
      2: 'Turn 2',
      3: 'Turn 3',
      4: 'Turn 4',
      5: 'Turn 5',
      6: 'Turn 6 - Raffles Blvd',
      7: 'Turn 7 - Memorial Corner',
      8: 'Turn 8 - Stamford',
      9: 'Turn 9 - Padang',
      10: 'Turn 10 - Singapore Sling',
      11: 'Turn 11',
      12: 'Turn 12',
      13: 'Turn 13 - Fullerton',
      14: 'Turn 14 - Connaught',
      15: 'Turn 15',
      16: 'Turn 16 - Waterfront Straight',
      17: 'Turn 17',
      18: 'Turn 18 - Bayview',
      19: 'Turn 19',
    }

    // Sector mapping for modern Singapore GP
    // Sector 1: Start/Finish through Turn 5
    // Sector 2: Turn 6 through Turn 13
    // Sector 3: Turn 14 through Turn 19
    const normTurns = data.turns.map(t => {
      const pt = transformPt(t.x, t.y)
      let sector = 1
      if (t.num >= 6 && t.num <= 13) sector = 2
      else if (t.num >= 14) sector = 3
      return {
        number: t.num,
        x: pt.x,
        y: pt.y,
        name: turnNames[t.num] || `Turn ${t.num}`,
        sector,
      }
    })

    // Start/Finish point: on pit straight before Turn 1
    const p1 = normTurns.find(t => t.number === 1)
    const p19 = normTurns.find(t => t.number === 19)
    const sfPoint = {
      x: Math.round(((p1.x + p19.x) / 2) * 10) / 10,
      y: Math.round(((p1.y + p19.y) / 2) * 10) / 10,
    }

    const output = {
      viewBox: '0 0 500 350',
      path: pathD,
      startFinishPoint: sfPoint,
      turnsData: normTurns,
    }

    fs.writeFileSync('F:/F1/scripts/marina_bay_processed.json', JSON.stringify(output, null, 2))
    console.log('Saved processed Marina Bay geometry!')

    client.close()
  } finally {
    edge.kill()
    try {
      fs.rmSync(profileDir, { recursive: true, force: true })
    } catch {}
  }
}

main().catch(console.error)
