import fs from 'fs';

function sanitizeRaceName(raceName, circuitId, country) {
  const cId = circuitId?.toLowerCase() || '';
  const cCountry = country?.toLowerCase() || '';
  const nameLower = raceName.toLowerCase();

  if (
    cId === 'sepang' ||
    cCountry === 'malaysia' ||
    nameLower.includes('in malaysia') ||
    (nameLower.includes('bahrain') && nameLower.includes('malaysia'))
  ) {
    return 'Malaysian Grand Prix';
  }

  if (nameLower.includes(' in ')) {
    const match = raceName.match(/(.*?\bGrand Prix\b)/i);
    if (match) {
      return match[1].trim();
    }
  }

  return raceName;
}

const sched = JSON.parse(fs.readFileSync('scripts/current_schedule.json', 'utf8'));
const races = sched.MRData.RaceTable.Races;

console.log('| Round | Raw Jolpica Name | Circuit | Sanitized Official Name | Changed? |');
console.log('|-------|-------------------|---------|--------------------------|----------|');
races.forEach(r => {
  const sanitized = sanitizeRaceName(r.raceName, r.Circuit?.circuitId, r.Circuit?.Location?.country);
  const changed = r.raceName !== sanitized ? 'YES (**FIXED**)' : 'No';
  console.log(`| Round ${r.round.padStart(2, '0')} | ${r.raceName} | ${r.Circuit.circuitName} | ${sanitized} | ${changed} |`);
});
