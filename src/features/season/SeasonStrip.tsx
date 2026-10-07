import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { F1Race } from '@/api/types'
import { useTimezone } from '@/context/TimezoneContext'
import { CountryFlag } from '@/lib/flags'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SeasonStripProps {
  races: F1Race[]
  currentSeason: string
  availableSeasons: string[]
  onSeasonChange: (season: string) => void
  nextRoundNumber?: string
  isLoading?: boolean
}

export const SeasonStrip: React.FC<SeasonStripProps> = ({
  races,
  currentSeason,
  availableSeasons,
  onSeasonChange,
  nextRoundNumber,
  isLoading,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextCardRef = useRef<HTMLDivElement>(null)
  const { formatDate, timezoneAbbr } = useTimezone()

  // Auto-scroll to the next round on mount (only horizontal track, window stays static)
  useEffect(() => {
    if (nextCardRef.current && scrollRef.current) {
      const container = scrollRef.current
      const card = nextCardRef.current
      setTimeout(() => {
        const offset = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2
        container.scrollTo({
          left: Math.max(0, offset),
          behavior: 'smooth',
        })
      }, 300)
    }
  }, [races, nextRoundNumber])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <section className="py-12 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 w-64 shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  const nowMs = Date.now()

  return (
    <section className="py-12 border-b border-[var(--border)] bg-[var(--surface-1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-text)] font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              CHAMPIONSHIP CALENDAR
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[var(--text)] uppercase tracking-[0.01em] mt-1">
              Season Rounds Strip
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Dynamic Year Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-muted)] font-semibold">Season:</span>
              <select
                value={currentSeason}
                onChange={(e) => onSeasonChange(e.target.value)}
                className="bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-3 py-1.5 text-xs font-mono font-bold text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors cursor-pointer"
                aria-label="Select championship season"
              >
                {availableSeasons.map((year) => (
                  <option key={year} value={year}>
                    {year} Season
                  </option>
                ))}
              </select>
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="p-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
                aria-label="Scroll season strip left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
                aria-label="Scroll season strip right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x select-none"
        >
          {races.map((race) => {
            const raceId = `${race.season}-${race.round}`
            const raceMs = new Date(race.date + (race.time ? `T${race.time}` : 'T12:00:00Z')).getTime()
            const isCompleted = nowMs > raceMs + 3 * 60 * 60 * 1000
            const isNext = race.round === nextRoundNumber

            return (
              <div
                key={race.round}
                ref={isNext ? nextCardRef : null}
                className="snap-start shrink-0"
              >
                <Link
                  to={`/race/${raceId}`}
                  className={cn(
                    'block w-64 p-4 rounded-xl border text-left transition-all duration-200 group active:scale-[0.98] hover:-translate-y-0.5',
                    isNext
                      ? 'f1-card-accent bg-[var(--surface-2)] border-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]'
                      : isCompleted
                      ? 'bg-[var(--surface-2)]/60 border-[var(--border)] hover:border-[var(--text-muted)]'
                      : 'bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--text-muted)] shadow-xs'
                  )}
                >
                  {/* Round Header & Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-black text-[var(--text-muted)]">
                      ROUND {String(race.round).padStart(2, '0')}
                    </span>

                    {isNext ? (
                      <Badge variant="live" pulse>
                        NEXT RACE
                      </Badge>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--timing-green)] font-bold">
                        <span className="checkered-flag-icon" />
                        DONE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-semibold">
                        UPCOMING
                      </span>
                    )}
                  </div>

                  {/* Flag & Country */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <CountryFlag country={race.Circuit.Location.country} className="w-4 h-3 rounded-xs shadow-xs" />
                    <span className="text-xs font-mono text-[var(--text-muted)] truncate font-semibold">
                      {race.Circuit.Location.country}
                    </span>
                  </div>

                  {/* Race Name */}
                  <h3 className="font-display font-black text-sm uppercase tracking-[0.01em] text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {race.raceName}
                  </h3>

                  {/* Circuit Name */}
                  <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 font-sans">
                    {race.Circuit.circuitName}
                  </p>

                  {/* Date & Timezone */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[var(--text)] font-semibold">
                      {formatDate(race.date)}
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px]">
                      {timezoneAbbr}
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
