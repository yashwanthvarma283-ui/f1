import fs from 'fs'

const content = fs.readFileSync('F:/F1/scripts/marina_bay_raw.svg', 'utf8')

// Find all path elements
const pathMatches = content.matchAll(/<path([^>]+)>/g)
for (const match of pathMatches) {
  const attrs = match[1]
  const idMatch = attrs.match(/id="([^"]+)"/)
  const dMatch = attrs.match(/d="([^"]+)"/)
  const id = idMatch ? idMatch[1] : 'unknown'
  if (dMatch) {
    console.log(`Path [${id}]: length=${dMatch[1].length}, preview=${dMatch[1].slice(0, 60)}...`)
  }
}

// Find all text elements and their coordinates
const textMatches = content.matchAll(/<text([^>]+)>([\s\S]*?)<\/text>/g)
console.log('\n--- Text Elements ---')
for (const match of textMatches) {
  const attrs = match[1]
  const textBody = match[2].replace(/<[^>]+>/g, '').trim()
  const xMatch = attrs.match(/x="([^"]+)"/)
  const yMatch = attrs.match(/y="([^"]+)"/)
  const transformMatch = attrs.match(/transform="([^"]+)"/)
  console.log(`Text "${textBody}": x=${xMatch?.[1]}, y=${yMatch?.[1]}, transform=${transformMatch?.[1]}`)
}
