import { RaceCoverageReport } from '../../src/types/data'

export class CoverageReporter {
  /**
   * Generates a formatted ASCII table string for CLI display.
   */
  static formatAsciiTable(report: RaceCoverageReport): string {
    const lines: string[] = []
    lines.push('\n' + '='.repeat(84))
    lines.push(
      ` RACE COVERAGE VALIDATION REPORT: ${report.raceName.toUpperCase()} (${report.year} R${report.round})`
    )
    lines.push('='.repeat(84))
    lines.push(
      'Session'.padEnd(18) +
      'Drivers'.padEnd(10) +
      'Laps'.padEnd(10) +
      'Stints'.padEnd(10) +
      'Pits'.padEnd(8) +
      'Radio'.padEnd(14) +
      'RaceCtrl'.padEnd(14)
    )
    lines.push('-'.repeat(84))

    for (const [sessionName, s] of Object.entries(report.sessions)) {
      const radioStr = `${s.radioClipsCount} (${s.radioMappedPercentage}%)`
      const rcStr = `${s.raceControlMessagesCount} (${s.raceControlMappedPercentage}%)`

      lines.push(
        sessionName.padEnd(18) +
        String(s.driversCount).padEnd(10) +
        String(s.lapsCount).padEnd(10) +
        (s.stintsAvailable ? 'YES' : 'NO').padEnd(10) +
        String(s.pitStopsCount).padEnd(8) +
        radioStr.padEnd(14) +
        rcStr.padEnd(14)
      )
    }

    lines.push('-'.repeat(84))
    const totalScore =
      Object.values(report.sessions).reduce((acc, curr) => acc + curr.overallCompletenessPercent, 0) /
      Math.max(1, Object.keys(report.sessions).length)

    lines.push(` OVERALL RACE COMPLETENESS SCORE: ${totalScore.toFixed(1)}%`)
    lines.push('='.repeat(84) + '\n')

    return lines.join('\n')
  }
}
