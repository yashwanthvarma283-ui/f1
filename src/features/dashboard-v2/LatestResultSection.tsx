import React from 'react'
import { useLastRaceResult } from '@/api/useF1Data'
import { getTeamMeta } from '@/lib/teams'
import { Section, SectionHeading, RowSkeleton, QuietError, Figure, Label, EMPTY } from './primitives'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import type { RaceResultEntry } from '@/types/data'

import { driverHeadshots } from '@/lib/driverImages'
import { teamLogos } from '@/lib/teamLogos'
import { StandingsSection } from './StandingsSection'

// Map position to podium height
const PODIUM_HEIGHT = {
  1: 'h-[160px]',
  2: 'h-[120px]',
  3: 'h-[90px]'
}

const PodiumSpot: React.FC<{ entry: any; position: 1 | 2 | 3; winnerTime: string }> = ({ entry, position }) => {
  const teamMeta = getTeamMeta(entry.Constructor.constructorId)
  const headshot = driverHeadshots[entry.number]
  const logo = teamLogos[teamMeta.id]

  return (
    <div className="flex flex-col items-center justify-end">
      {/* Driver HD Image behind the info/number */}
      {headshot && (
        <motion.div 
          className="relative w-32 h-32 md:w-40 md:h-40 -mb-4 z-10 drop-shadow-2xl flex justify-center items-end"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: position * 0.1 }}
        >
          <img src={headshot} alt={entry.Driver.familyName} className="max-w-full max-h-full object-contain object-bottom mask-image-bottom" style={{ WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 20%)', maskImage: 'linear-gradient(to top, transparent 0%, black 20%)' }} />
        </motion.div>
      )}

      {/* Driver info above block */}
      <div className="text-center mb-3 z-20">
        <div className="font-bold text-[18px] md:text-[22px] leading-tight uppercase tracking-tight">
          {entry.Driver.familyName}
        </div>
        <div className="flex items-center justify-center gap-2 mt-1">
          {logo && <img src={logo} alt={teamMeta.name} className="h-4 w-auto object-contain opacity-90" />}
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {teamMeta.name}
          </div>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 lg:mt-8">
        <div className="lg:col-span-7 flex flex-col">
          {/* Podium Component */}
          <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8 mt-4 md:mt-8 mb-12 h-[240px] md:h-[260px]">
            {p2 && <PodiumSpot entry={p2} position={2} winnerTime={p1?.Time?.time || ''} />}
            {p1 && <PodiumSpot entry={p1} position={1} winnerTime={p1?.Time?.time || ''} />}
            {p3 && <PodiumSpot entry={p3} position={3} winnerTime={p1?.Time?.time || ''} />}
          </div>

          <div className="mt-auto border-t border-[var(--border-subtle)]">
            <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
              <Label className="w-8">Pos</Label>
              <Label className="flex-1">Driver</Label>
              <Label className="w-24 text-right">Time</Label>
              <Label className="w-12 text-right ml-4">Pts</Label>
            </div>
            
            <div className="divide-y divide-[var(--border-subtle)] flex flex-col">
              {top10.map((item, idx) => {
                const teamMeta = getTeamMeta(item.Constructor.constructorId)
                
                return (
                  <motion.div 
                    key={item.Driver.driverId} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group relative flex items-center px-4 py-3 hover:bg-[var(--surface-1)] transition-colors duration-150 overflow-hidden"
                  >
                    {/* Hover slide-in highlight edge */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 -translate-x-full group-hover:translate-x-0 transition-transform duration-150 ease-[var(--ease-out)]"
                      style={{ backgroundColor: teamMeta.color }}
                      aria-hidden="true"
                    />

                    <div className="w-8 flex items-center">
                      <Figure className="text-[14px] font-medium text-[var(--text-muted)]">
                        {item.position}
                      </Figure>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="font-semibold text-[15px]">
                          {item.Driver.givenName} <span className="uppercase">{item.Driver.familyName}</span>
                        </span>
                        <div className="hidden sm:flex items-center gap-2">
                          {teamLogos[teamMeta.id] && (
                            <img src={teamLogos[teamMeta.id]} alt={teamMeta.name} className="h-3 w-auto object-contain" />
                          )}
                          <span className="text-[var(--text-muted)] text-[12px] truncate max-w-[120px]">{item.Constructor.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-24 text-right">
                      <span className="truncate block" title={item.Time?.time || item.status}>
                        <Figure className="text-[13px] text-[var(--text-muted)]">
                          {item.Time?.time || item.status || EMPTY}
                        </Figure>
                      </span>
                    </div>
                    
                    <div className="w-12 text-right ml-4">
                      <Figure className="text-[14px] font-medium">
                        {item.points}
                      </Figure>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <StandingsSection />
        </div>
      </div>
    </Section>
  )
}
