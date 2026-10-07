async function test() {
  const res = await fetch('https://api.jolpi.ca/ergast/f1/current.json').then(r => r.json());
  const races = res.MRData.RaceTable.Races;
  console.log(`Total races: ${races.length}`);
  for (const r of races) {
    console.log(`Round ${r.round.padStart(2, '0')}: raceName="${r.raceName}" | circuit="${r.Circuit.circuitName}" (${r.Circuit.Location.locality}, ${r.Circuit.Location.country}) [circuitId: ${r.Circuit.circuitId}]`);
  }
}
test().catch(console.error);
