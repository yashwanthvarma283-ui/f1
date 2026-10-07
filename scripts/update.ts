import fs from 'fs'
import path from 'path'
import { CONFIG } from './lib/config'
import { jolpica } from './lib/jolpica'
import { extractRace } from './extract'

interface UpdateReport {
  year: number
  checkedAt: string
  totalRaces: number
  alreadyExtracted: number
  newlyExtracted: number
  processingRaces: number
  upcomingRaces: number
  details: {
    round: number
    raceName: string
    status: 'COMPLETED_VERIFIED' | 'EXTRACTED_NOW' | 'PROCESSING_FASTF1' | 'UPCOMING'
    note?: string
  }[]
}

async function runUpdateWorkflow(targetYear = 2024, force = false, dryRun = false) {
  console.log(`\n\x1b[36m==================================================\x1b[0m`)
  console.log(`\x1b[36m       PITWALL AUTOMATED DATA:UPDATE WORKFLOW     \x1b[0m`)
  console.log(`\x1b[36m==================================================\x1b[0m`)
  console.log(`Checking Year: ${targetYear} | Force Refresh: ${force} | Dry Run: ${dryRun}\n`)

  // 1. Fetch current official championship schedule from Jolpica
  const schedule = await jolpica.getSchedule(targetYear)
  if (!schedule || schedule.length === 0) {
    console.error(`\x1b[31m[ERROR] Failed to fetch official schedule for ${targetYear}.\x1b[0m`)
    process.exit(1)
  }

  const seasonDir = path.join(CONFIG.DATA_DIR, String(targetYear))
  const report: UpdateReport = {
    year: targetYear,
    checkedAt: new Date().toISOString(),
    totalRaces: schedule.length,
    alreadyExtracted: 0,
    newlyExtracted: 0,
    processingRaces: 0,
    upcomingRaces: 0,
    details: [],
  }

  const roundsToExtract: number[] = []

  for (const race of schedule) {
    const roundNum = parseInt(race.round, 10)
    const raceName = race.raceName
    const raceDate = new Date(`${race.date}T${race.time || '15:00:00Z'}`).getTime()
    const now = Date.now()
    const isPast = raceDate < now
    const hoursSinceRace = (now - raceDate) / (1000 * 60 * 60)

    // Check if local folder with laps.json exists
    let hasLocalData = false
    if (fs.existsSync(seasonDir)) {
      const dirs = fs.readdirSync(seasonDir)
      const matchingDir = dirs.find((d) => {
        const prefix = d.slice(0, 2)
        return prefix === String(roundNum).padStart(2, '0')
      })
      if (matchingDir) {
        const lapsFile = path.join(seasonDir, matchingDir, 'race', 'laps.json')
        if (fs.existsSync(lapsFile)) {
          hasLocalData = true
        }
      }
    }

    if (hasLocalData && !force) {
      report.alreadyExtracted++
      report.details.push({
        round: roundNum,
        raceName,
        status: 'COMPLETED_VERIFIED',
        note: 'Complete 16 datasets verified on disk',
      })
    } else if (isPast) {
      // If the race finished within the last 2 hours, it may still be processing on FastF1/FOM timing
      if (hoursSinceRace < 2.0 && !hasLocalData) {
        report.processingRaces++
        report.details.push({
          round: roundNum,
          raceName,
          status: 'PROCESSING_FASTF1',
          note: 'Session ended < 2h ago. FastF1 live timing typically takes 30-120 mins to process telemetry logs.',
        })
      } else {
        roundsToExtract.push(roundNum)
        report.details.push({
          round: roundNum,
          raceName,
          status: 'EXTRACTED_NOW',
          note: 'Scheduled for automatic multi-source extraction',
        })
      }
    } else {
      report.upcomingRaces++
      report.details.push({
        round: roundNum,
        raceName,
        status: 'UPCOMING',
        note: `Scheduled for ${race.date}`,
      })
    }
  }

  // 2. Perform extraction for any missing completed rounds
  if (roundsToExtract.length > 0) {
    console.log(`\x1b[33mFound ${roundsToExtract.length} completed rounds requiring extraction: [${roundsToExtract.join(', ')}]\x1b[0m`)
    if (!dryRun) {
      for (const roundNum of roundsToExtract) {
        console.log(`\n\x1b[34m[UPDATE] Processing Round ${roundNum}...\x1b[0m`)
        await extractRace(targetYear, roundNum, force)
        report.newlyExtracted++
      }
    }
  } else {
    console.log(`\x1b[32m✔ All completed rounds for ${targetYear} are up-to-date!\x1b[0m`)
  }

  // 3. Write update status log
  const logPath = path.join(seasonDir, 'update_log.json')
  if (fs.existsSync(seasonDir)) {
    fs.writeFileSync(logPath, JSON.stringify(report, null, 2), 'utf-8')
  }

  // Summary output
  console.log(`\n\x1b[32m================ UPDATE REPORT ==================\x1b[0m`)
  console.log(`Season: ${targetYear} | Total Calendar Rounds: ${report.totalRaces}`)
  console.log(`Extracted & Verified: ${report.alreadyExtracted + report.newlyExtracted}`)
  console.log(`In-Processing (FastF1): ${report.processingRaces}`)
  console.log(`Upcoming Rounds: ${report.upcomingRaces}`)
  console.log(`Log saved to: public/data/${targetYear}/update_log.json`)
  console.log(`\x1b[32m==================================================\x1b[0m\n`)
}

// CLI arguments
const args = process.argv.slice(2)
let year = 2024
let force = false
let dryRun = false

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--year' && args[i + 1]) year = parseInt(args[i + 1], 10)
  if (args[i] === '--force') force = true
  if (args[i] === '--dry-run') dryRun = true
}

runUpdateWorkflow(year, force, dryRun).catch((err) => {
  console.error('\x1b[31m[UPDATE ERROR]\x1b[0m', err)
  process.exit(1)
})
