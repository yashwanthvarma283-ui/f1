import React from 'react'
import { useLastRaceResult } from '@/api/useF1Data'
import { getTeamMeta } from '@/lib/teams'
import { Section, SectionHeading, RowSkeleton, QuietError, Figure, Label, EMPTY } from './primitives'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import type { RaceResultEntry } from '@/types/data'
import { StandingsSection } from './StandingsSection'

// Map position to podium height
const PODIUM_HEIGHT = {
  1: 'h-[160px]',
  2: 'h-[120px]',
  3: 'h-[90px]'
}

const PodiumSpot: React.FC<{ entry: any; position: 1 | 2 | 3; winnerTime: string }> = ({ entry, position }) => {
  const teamMeta = getTeamMeta(entry.Constructor.constructorId)
  return (
    <div className="flex flex-col items-center justify-end">
      {/* Driver info above block */}
      <div className="text-center mb-3">
        <div className="font-bold text-[18px] md:text-[22px] leading-tight uppercase tracking-tight">
          {entry.Driver.familyName}
        </div>
        <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">
          {teamMeta.name}
        </div>
        {position !== 1 && (
          <div className="dv2-fig text-[11px] text-[var(--text-muted)] mt-1">
            {entry.Time?.time || entry.status || EMPTY}
          </div>
        )}
      </div>

      {/* Podium block */}
      <motion.div 
        className={cn("w-20 md:w-24 bg-[var(--surface-1)] border-t-2 rounded-t-[4px] relative flex flex-col items-center justify-start pt-4", PODIUM_HEIGHT[position])}
        style={{ borderColor: teamMeta.color }}
        initial={{ height: 0, opacity: 0 }}
        whileInView={{ height: parseInt(PODIUM_HEIGHT[position].replace(/\D/g,'')), opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.2, delay: position * 0.1 }}
      >
        <span className="font-[family-name:var(--font-display)] text-[48px] font-bold text-[var(--border)] opacity-40 leading-none">
          {position}
        </span>
      </motion.div>
    </div>
  )
}

export const LatestResultSection: React.FC<{ id?: string }> = ({ id }) => {
  const { data: result, isLoading, isError, refetch } = useLastRaceResult()

  if (isLoading) {
    return (
      <Section id={id || 'results'}>
        <SectionHeading subtitle="Previous Race">Latest Result</SectionHeading>
        <RowSkeleton rows={10} />
      </Section>
    )
  }

  if (isError || !result || result.results.length === 0) {
    return (
      <Section id={id || 'results'}>
        <SectionHeading subtitle="Previous Race">Latest Result</SectionHeading>
        <QuietError message="Could not load latest race result." onRetry={refetch} />
      </Section>
    )
  }

  const p1 = result.results.find(r => r.position === '1')
  const p2 = result.results.find(r => r.position === '2')
  const p3 = result.results.find(r => r.position === '3')
  const top10 = result.results.slice(3, 10) // table shows the rest of top 10

  return (
    <Section id={id || 'results'}>
      <SectionHeading subtitle={`Round ${result.round}   ${result.season}`}>
        {result.raceName}
      </SectionHeading>
      
      {/* Podium Component */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8 mt-12 mb-12 h-[260px]">
        {p2 && <PodiumSpot entry={p2} position={2} winnerTime={p1?.Time?.time || ''} />}
        {p1 && <PodiumSpot entry={p1} position={1} winnerTime={p1?.Time?.time || ''} />}
        {p3 && <PodiumSpot entry={p3} position={3} winnerTime={p1?.Time?.time || ''} />}
      </div>

      <div className="mt-8">
        <StandingsSection id="standings" />
      </div>
    </Section>
  )
}
