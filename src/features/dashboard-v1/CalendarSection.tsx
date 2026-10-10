import React, { useState } from 'react'
import { useSchedule, useAvailableSeasons } from '@/api/useF1Data'
import { SessionService } from '@/api/sessionService'
import { useTimezone } from '@/context/TimezoneContext'
import { CountryFlag } from '@/lib/flags'
import { Section, SectionHeading, RowSkeleton, QuietError, Figure, Label, orDash } from './primitives'
import { cn } from '@/lib/utils'

export const CalendarSection: React.FC<{ id?: string }> = ({ id }) => {
  const [season, setSeason] = useState<string>('current')
  const { data: schedule, isLoading, isError, refetch } = useSchedule(season)
  const { data: availableSeasons } = useAvailableSeasons()
  const tz = useTimezone()

  return (
    <Section id={id || 'calendar'}>
      <SectionHeading
        action={
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="dv2-press bg-[var(--surface-2)] border border-[var(--border)] rounded-full px-4 py-1.5 text-[13px] font-semibold text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
            aria-label="Select Season"
          >
            <option value="current">Current Season</option>
            {availableSeasons?.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
      >
        Calendar
      </SectionHeading>
      
      {isLoading ? (
        <RowSkeleton rows={10} className="mt-8 border-t border-[var(--border-subtle)]" />
      ) : isError || !schedule ? (
        <QuietError message="Could not load the calendar." onRetry={refetch} />
      ) : (
        <div className="mt-8 border-t border-[var(--border-subtle)]">
          <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <Label className="w-12">Rnd</Label>
            <Label className="w-32 hidden md:block">Dates</Label>
            <Label className="flex-1">Grand Prix</Label>
            <Label className="w-32 hidden sm:block">Status</Label>
          </div>
          
          <div className="divide-y divide-[var(--border-subtle)]">
            {schedule.races.map((race) => {
              const sessions = SessionService.extractWeekendSessions(race)
              const firstSession = sessions[0]
              const lastSession = sessions[sessions.length - 1]
              
              const dates = (firstSession && lastSession) ? tz.formatWeekendSpan(firstSession.startTimeIso) : null
              const isPast = lastSession?.isFinished
              const isActive = sessions.some(s => s.isLive)
              
              let statusText = 'Upcoming'
              if (isActive) statusText = 'Live'
              else if (isPast) statusText = 'Finished'

              return (
                <div key={race.round} className={cn('group flex items-center px-4 py-4 hover:bg-[var(--surface-1)] transition-colors duration-150', isPast && 'opacity-60 hover:opacity-100')}>
                  <div className="w-12">
                    <Figure className="text-[14px] font-medium text-[var(--text-muted)]">{String(race.round).padStart(2, '0')}</Figure>
                  </div>
                  
                  <div className="w-32 hidden md:block">
                    <Figure className="text-[13px] font-medium">{orDash(dates)}</Figure>
                  </div>
                  
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <div className="flex items-center gap-3">
                      {race.Circuit.Location.country && <CountryFlag country={race.Circuit.Location.country} className="w-6 h-6 rounded-[2px]" />}
                      <span className="font-semibold text-[15px]">{race.raceName}</span>
                    </div>
                    <span className="text-[13px] text-[var(--text-muted)] hidden sm:block truncate" title={race.Circuit.circuitName}>
                      {race.Circuit.circuitName}
                    </span>
                  </div>
                  
                  <div className="w-32 hidden sm:block">
                    <span className={cn(
                      'text-[13px] font-semibold uppercase tracking-wider',
                      isActive ? 'text-[var(--accent)]' : (isPast ? 'text-[var(--text-muted)]' : 'text-[var(--text)]')
                    )}>
                      {statusText}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Section>
  )
}
