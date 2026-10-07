async function main() {
  const scheduleRes = await fetch('https://api.jolpi.ca/ergast/f1/current.json').then(r => r.json())
  const races = scheduleRes.MRData.RaceTable.Races
  console.log('Season:', scheduleRes.MRData.RaceTable.season, 'Count:', races.length)
  for (const r of races) {
    console.log(`Round ${r.round}: "${r.raceName}" at "${r.Circuit.circuitName}" (${r.Circuit.Location.locality}, ${r.Circuit.Location.country})`)
  }

  const lastRes = await fetch('https://api.jolpi.ca/ergast/f1/current/last/results.json').then(r => r.json())
  const lastRace = lastRes?.MRData?.RaceTable?.Races?.[0]
  if (lastRace) {
    console.log('\nLast race result:', lastRace.round, lastRace.raceName, lastRace.Circuit.circuitName)
  }
}

main().catch(console.error)
