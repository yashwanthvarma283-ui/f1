import React from 'react'
import { useLastRaceResult } from '@/api/useF1Data'
import { getTeamMeta } from '@/lib/teams'
import { CountryFlag } from '@/lib/flags'
import { Section, SectionHeading, RowSkeleton, QuietError, Figure, Label, EMPTY } from './primitives'
import { cn } from '@/lib/utils'

export const LatestResultSection: React.FC<{ id?: string }> = ({ id }) => {
  const { data: result, isLoading, isError, refetch } = useLastRaceResult()

  if (isLoading) {
    return (
      <Section id={id || 'results'}>
        <SectionHeading>Latest Result</SectionHeading>
        <RowSkeleton rows={10} />
      </Section>
    )
  }

  if (isError || !result) {
    return (
      <Section id={id || 'results'}>
        <SectionHeading>Latest Result</SectionHeading>
        <QuietError message="Could not load latest race result." onRetry={refetch} />
      </Section>
    )
  }

  const top10 = result.results.slice(0, 10)

  return (
    <Section id={id || 'results'}>
      <SectionHeading>
        {result.raceName}
        <span className="block text-[15px] font-sans font-medium text-[var(--text-muted)] normal-case tracking-normal mt-2">
          {result.season} Round {result.round}
        </span>
      </SectionHeading>
      
      <div className="mt-8 border-t border-[var(--border-subtle)]">
        <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
          <Label className="w-12">Pos</Label>
          <Label className="flex-1">Driver</Label>
          <Label className="w-32 hidden sm:block">Team</Label>
          <Label className="w-24 text-right">Time/Status</Label>
          <Label className="w-16 text-right ml-4">Pts</Label>
        </div>
        
        <div className="divide-y divide-[var(--border-subtle)]">
          {top10.map((item, idx) => {
            const teamMeta = getTeamMeta(item.Constructor.constructorId)
            const isPodium = idx < 3
            
            return (
              <div key={item.Driver.driverId} className="group flex items-center px-4 py-3 hover:bg-[var(--surface-1)] transition-colors duration-150">
                <div className="w-12 flex items-center gap-2">
                  <span className="block w-1 h-6 shrink-0 rounded-[1px]" style={{ backgroundColor: teamMeta.color }} aria-hidden="true" />
                  <Figure className={cn('text-[15px]', isPodium ? 'font-bold' : 'font-medium')}>
                    {item.position}
                  </Figure>
                </div>
                
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-semibold text-[15px]">
                      {item.Driver.givenName} <span className="uppercase">{item.Driver.familyName}</span>
                    </span>
                    <span className="hidden sm:inline text-[var(--text-muted)] text-[13px] uppercase tracking-wider">{item.Driver.code}</span>
                  </div>
                </div>
                
                <div className="w-32 hidden sm:block">
                  <span className="text-[14px] text-[var(--text-muted)] truncate block" title={item.Constructor.name}>
                    {item.Constructor.name}
                  </span>
                </div>
                
                <div className="w-24 text-right">
                  <span className="truncate block" title={item.Time?.time || item.status}>
                    <Figure className="text-[14px] text-[var(--text-muted)]">
                      {item.Time?.time || item.status || EMPTY}
                    </Figure>
                  </span>
                </div>
                
                <div className="w-16 text-right ml-4">
                  <Figure className={cn('text-[15px]', isPodium ? 'font-bold' : 'font-medium')}>
                    {item.points}
                  </Figure>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {result.results.length > 10 && (
        <div className="mt-6 text-center">
          <span className="text-[13px] font-medium text-[var(--text-muted)]">— Full classification not shown —</span>
        </div>
      )}
    </Section>
  )
}
