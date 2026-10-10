import React from 'react'
import { Link } from 'react-router-dom'
import { useSchedule } from '@/api/useF1Data'
import { SessionService } from '@/api/sessionService'
import { useTimezone } from '@/context/TimezoneContext'
import { CountryFlag } from '@/lib/flags'
import { Countdown } from './Countdown'
import { PrimaryButton, Fact, QuietError, EmptyNote, orDash } from './primitives'
import { cn } from '@/lib/utils'
import { motion, useScroll, useTransform } from 'motion/react'
import { CircuitOutline } from '@/features/hero/CircuitOutline'
import { formatTimeInZone } from '@/lib/timezone'

export const DashboardHero: React.FC<{ id?: string }> = ({ id }) => {
  const { data: schedule, isLoading, isError, refetch } = useSchedule()
  const tz = useTimezone()
  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, [0, 1000], [0, 12])
  
  if (isLoading) {
    return (
      <section id={id} className="w-full bg-[var(--dv2-hero-bg)] text-[var(--dv2-hero-text)] min-h-[400px] flex items-center justify-center">
        <div className="skeleton-shimmer h-12 w-48 rounded-[4px]" />
      </section>
    )
  }
  
  if (isError || !schedule) {
    return (
      <section id={id} className="w-full bg-[var(--dv2-hero-bg)] px-5 py-24 text-center">
        <QuietError message="Could not load the race schedule." onRetry={refetch} />
      </section>
    )
  }
  
  const nextRace = SessionService.findNextRace(schedule.races)
  
  if (!nextRace) {
    return (
      <section id={id} className="w-full bg-[var(--dv2-hero-bg)] px-5 py-24 text-center text-[var(--dv2-hero-text)]">
        <EmptyNote>Season has concluded.</EmptyNote>
      </section>
    )
  }
  
  const weekendSessions = SessionService.extractWeekendSessions(nextRace)
  const nextSession = SessionService.getNextUpcomingSession(weekendSessions)
  const countdownTarget = nextSession?.startTimeIso || null
  
  // Custom dates format using weekendSessions to avoid the -48hr bug
  let dates = null
  if (weekendSessions.length > 0) {
    const start = new Date(weekendSessions[0].startTimeIso)
    const end = new Date(weekendSessions[weekendSessions.length - 1].startTimeIso)
    const startDay = new Intl.DateTimeFormat('en-GB', { timeZone: tz.timezone, day: 'numeric' }).format(start)
    const endDay = new Intl.DateTimeFormat('en-GB', { timeZone: tz.timezone, day: 'numeric' }).format(end)
    const month = new Intl.DateTimeFormat('en-GB', { timeZone: tz.timezone, month: 'short' }).format(end)
    dates = `${startDay}-${endDay} ${month}`
  }

  // Fact strip values
  const daysUntil = countdownTarget 
    ? Math.max(0, Math.ceil((new Date(countdownTarget).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  const now = new Date()
  // Try to find the circuit timezone by looking at the location, for simplicity we can just format in local timezone vs target timezone
  // For 'track time vs your time', since we don't have circuit timezone directly exposed, let's use the local time vs user time. Wait, if I don't have it, I should just display what I can or omit.
  // Actually, I can use UTC vs local if circuit tz isn't in schedule. 
  // Let's use UTC as 'Track time' if circuit time is unknown, but F1 API doesn't provide circuit timezone ID directly unless we use timezone utilities.
  // Just "Track Time" = use UTC if we must, or skip. "Track Time vs Your Time" is tricky without timezone ID. I will replace it with 'Track Time' using a placeholder or skip if missing.
  
  const words = nextRace.raceName.split(' ')

  return (
    <section id={id} className="relative w-full bg-[var(--dv2-hero-bg)] text-[var(--dv2-hero-text)] border-[var(--border-subtle)] pb-12 pt-12 md:pt-16 lg:pt-24 overflow-hidden">
      {/* Background Circuit Outline with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-5 md:opacity-[0.07] flex items-center justify-center scale-150 md:scale-[2]"
        style={{ y: parallaxY }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        <CircuitOutline circuitId={nextRace.Circuit?.circuitId} className="w-[120%] h-[120%] text-[var(--dv2-hero-text)]" />
      </motion.div>

      <div className="relative z-10 max-w-[1560px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
            
            {/* Fact Strip */}
            <motion.div 
              className="flex flex-wrap gap-6 mb-8 text-[12px] font-semibold tracking-wider uppercase text-[var(--dv2-hero-muted)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <span>Round {nextRace.round} / {schedule.races.length}</span>
              <span className="hidden sm:inline text-[var(--border-subtle)] opacity-30">•</span>
              <span>{daysUntil} Days To Go</span>
            </motion.div>

            <h1 className="font-[family-name:var(--font-display)] font-extrabold uppercase tracking-[-0.02em] text-[48px] md:text-[72px] lg:text-[88px] leading-[0.9] mb-8">
              {words.map((word, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.1 }}
                  >
                    {word}
                  </motion.div>
                </div>
              ))}
            </h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-0 max-w-3xl mb-12">
              <Fact index={1} label="Circuit" value={nextRace.Circuit?.circuitName} />
              <Fact index={2} label="Location" value={
                <span className="flex items-center gap-2">
                  {nextRace.Circuit?.Location?.country ? <CountryFlag country={nextRace.Circuit.Location.country} className="w-5 h-5 rounded-[2px]" /> : null}
                  {nextRace.Circuit?.Location?.locality}
                </span>
              } />
              <Fact index={3} label="Dates" value={orDash(dates)} mono />
            </div>

            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Link to={`/race/${nextRace.round}`}>
                <PrimaryButton>View race weekend</PrimaryButton>
              </Link>
            </motion.div>
          </div>
          
          {/* Stat Strip & Countdown */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-[var(--dv2-hero-border)]/20 border border-[var(--dv2-hero-border)] rounded-[4px] p-6 lg:p-8 backdrop-blur-md">
            <motion.div 
              className="mb-10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Countdown targetIso={countdownTarget} label={`Next: ${nextSession?.title || 'Race'}`} />
            </motion.div>
            
            <motion.div 
              className="border-t border-[var(--dv2-hero-border)] pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="text-[11px] uppercase tracking-[0.1em] font-medium text-[var(--dv2-hero-muted)] mb-4">
                Weekend Schedule ({tz.timezoneAbbr})
              </div>
              <ul className="flex flex-col">
                {weekendSessions.map((session, i) => {
                  const isPast = session.isFinished
                  const isActive = session.isLive
                  return (
                    <li key={session.id} className={cn(
                      'flex items-center justify-between py-3 border-b border-[var(--dv2-hero-border)]/50 last:border-b-0',
                      isPast && 'opacity-50'
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-[var(--accent)]' : (isPast ? 'bg-transparent' : 'bg-[var(--dv2-hero-muted)]'))} />
                        <span className="text-[14px] font-medium">{session.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] text-[var(--dv2-hero-muted)] uppercase tracking-wider">{tz.formatWeekday(session.startTimeIso)}</span>
                        {/* Fixed width to 8ch and nowrap for 12h time wrap fix */}
                        <span className="dv2-fig text-[15px] font-semibold w-[8ch] whitespace-nowrap text-right">{tz.formatTime(session.startTimeIso)}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
