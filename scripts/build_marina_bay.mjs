import fs from 'fs'

const content = fs.readFileSync('F:/F1/scripts/marina_bay_raw.svg', 'utf8')

// Find path4158 d
const matchD = content.match(/<path[\s\S]*?id="path4158"[\s\S]*?d="([^"]+)"/) || content.match(/<path[\s\S]*?d="([^"]+)"[\s\S]*?id="path4158"/)
const rawD = matchD[1]

// Check text elements
const textRegex = /<text([^>]+)>([\s\S]*?)<\/text>/g
const turns = []
let tMatch
while ((tMatch = textRegex.exec(content)) !== null) {
  const attrs = tMatch[1]
  const text = tMatch[2].replace(/<[^>]+>/g, '').trim()
  const num = parseInt(text, 10)
  if (!isNaN(num) && num >= 1 && num <= 19) {
    const xMatch = attrs.match(/x="([^"]+)"/)
    const yMatch = attrs.match(/y="([^"]+)"/)
    if (xMatch && yMatch) {
      turns.push({
        num,
        x: parseFloat(xMatch[1]),
        y: parseFloat(yMatch[1]),
      })
    }
  }
}

turns.sort((a, b) => a.num - b.num)
console.log('Found numbered turns:', turns.length)
console.log(turns)
