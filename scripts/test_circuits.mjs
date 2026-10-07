async function check() {
  const geojson = await fetch('https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/sg-2008.geojson').then(r => r.json())
  const coords = geojson.features[0].geometry.coordinates
  console.log('GeoJSON has coords:', coords.length)
  
  // Also check Wikimedia 2023 SVG path
  const wikiSvg = await fetch('https://upload.wikimedia.org/wikipedia/commons/8/8b/Marina_Bay_circuit_2023.svg').then(r => r.text())
  // Extract path with id="path4158"
  const match = wikiSvg.match(/id="path4158"[\s\S]*?d="([^"]+)"/) || wikiSvg.match(/d="([^"]+)"[\s\S]*?id="path4158"/)
  if (match) {
    console.log('Found Wikimedia 2023 path, length:', match[1].length)
  }
}

check()
