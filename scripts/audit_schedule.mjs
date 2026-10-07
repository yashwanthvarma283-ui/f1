import fs from 'fs';

const sched = JSON.parse(fs.readFileSync('scripts/current_schedule.json', 'utf8'));
const races = sched.MRData.RaceTable.Races;

console.log('Season:', sched.MRData.RaceTable.season, 'Count:', races.length);
races.forEach(r => {
  console.log(`Round ${r.round.padStart(2, '0')}: "${r.raceName}" | circuit="${r.Circuit.circuitName}" (${r.Circuit.Location.locality}, ${r.Circuit.Location.country}) [circuitId: ${r.Circuit.circuitId}]`);
});

const last = JSON.parse(fs.readFileSync('scripts/last_result.json', 'utf8'));
const lastRace = last.MRData.RaceTable.Races[0];
console.log('\nLast Race:');
console.log(`Round ${lastRace.round}: "${lastRace.raceName}" | circuit="${lastRace.Circuit.circuitName}" (${lastRace.Circuit.Location.locality}, ${lastRace.Circuit.Location.country}) [circuitId: ${lastRace.Circuit.circuitId}]`);
