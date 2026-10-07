import fs from 'fs'

async function run() {
  const t = await fetch('https://upload.wikimedia.org/wikipedia/commons/8/8b/Marina_Bay_circuit_2023.svg').then(r => r.text())
  fs.writeFileSync('F:/F1/scripts/marina_bay_raw.svg', t)
  console.log('Saved raw svg, size:', t.length)
}

run()
