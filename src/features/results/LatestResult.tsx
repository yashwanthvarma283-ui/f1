import React from 'react'
import { Link } from 'react-router-dom'
import { LastRaceResultPayload, F1ResultItem } from '@/api/types'
import { getTeamMeta } from '@/lib/teams'
import { CountryFlag } from '@/lib/flags'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { Trophy, Timer, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LatestResultProps {
  lastResult: LastRaceResultPayload | null
  isLoading?: boolean
  error?: Error | null
}

interface PodiumCardProps {
  position: 1 | 2 | 3
  item: F1ResultItem
  winnerTime?: string
}

const PodiumCard: React.FC<PodiumCardProps> = ({ position, item }) => {
  const team = getTeamMeta(item.Constructor.constructorId)

  const posConfig = {
    1: {
      label: 'P1 WINNER',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
      elevation: 'md:-translate-y-4',
    },
    2: {
      label: 'P2 PODIUM',
      badgeClass: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-400/20 dark:text-slate-200 dark:border-slate-400/40',
      elevation: 'md:-translate-y-2',
    },
    3: {
      label: 'P3 PODIUM',
      badgeClass: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-700/20 dark:text-amber-300 dark:border-amber-700/40',
      elevation: '',
    },
  }[position]

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--card-shadow-hover)]',
        posConfig.elevation
      )}
    >
      {/* Team accent bar at top edge - strictly team color per F1 Colour Rule */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: team.color }}
      />

      <div className="space-y-3">
        {/* Header Position Badge & Country Flag */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border',
              posConfig.badgeClass
            )}
          >
            {posConfig.label}
          </span>
          <CountryFlag country={item.Driver.nationality} className="w-4 h-3 rounded-xs shadow-xs" />
        </div>

        {/* Driver Name & Number - tracking-[0.01em] avoids glyphs touching */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-xl sm:text-2xl text-[var(--text)] uppercase tracking-[0.01em]">
              {item.Driver.givenName}{' '}
              <span className="text-[var(--text)]">{item.Driver.familyName}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
              #{item.number}
            </span>
            <span className="text-xs text-[var(--text-muted)] truncate">{item.Constructor.name}</span>
          </div>
        </div>
      </div>

      {/* Timing and Points footer with Animated Counter */}
      <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-[var(--text-muted)] text-[10px] block uppercase font-bold">TIME / GAP</span>
          <span className="text-[var(--text)] font-semibold tabular-nums">
            {position === 1 ? item.Time?.time || 'Winner' : item.Time?.time || '+Delta'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[var(--text-muted)] text-[10px] block uppercase font-bold">POINTS</span>
          <span className="text-[var(--accent-text)] font-black tabular-nums">
            +<AnimatedCounter value={Number(item.points) || 0} /> PTS
          </span>
        </div>
      </div>
    </div>
  )
}

export const LatestResult: React.FC<LatestResultProps> = ({ lastResult, isLoading, error }) => {
  if (isLoading) {
    return (
      <section className="py-12 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        </div>
      </section>
    )
  }

  if (error || !lastResult || lastResult.podium.length === 0) {
    return null
  }

  const raceId = `${lastResult.season}-${lastResult.round}`

  return (
    <section className="py-12 border-b border-[var(--border)] bg-[var(--surface-1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-text)] font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              LATEST GRAND PRIX RESULT
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[var(--text)] uppercase tracking-[0.01em] mt-1">
              {lastResult.raceName}{' '}
              <span className="text-[var(--text-muted)] font-normal text-lg">({lastResult.season})</span>
            </h2>
          </div>

          <Link
            to={`/race/${raceId}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group"
          >
            <span>Full Classification ({lastResult.results.length} Drivers)</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3-Step Podium Grid with Card Hover Lift */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Winner (P1) */}
          {lastResult.podium[0] && (
            <div className="md:order-2">
              <PodiumCard position={1} item={lastResult.podium[0]} />
            </div>
          )}

          {/* 2nd place (P2) */}
          {lastResult.podium[1] && (
            <div className="md:order-1">
              <PodiumCard position={2} item={lastResult.podium[1]} />
            </div>
          )}

          {/* 3rd place (P3) */}
          {lastResult.podium[2] && (
            <div className="md:order-3">
              <PodiumCard position={3} item={lastResult.podium[2]} />
            </div>
          )}
        </div>

        {/* Fastest Lap Banner (DHL Official Timing Purple) */}
        {lastResult.fastestLap && (
          <div className="f1-card-accent flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--timing-purple)]/15 border border-[var(--timing-purple)]/30 text-[var(--timing-purple)]">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--timing-purple)] font-bold block">
                  DHL OFFICIAL FASTEST LAP (+1 BONUS POINT)
                </span>
                <span className="font-bold text-[var(--text)]">
                  {lastResult.fastestLap.Driver.givenName} {lastResult.fastestLap.Driver.familyName}
                </span>{' '}
                <span className="text-[var(--text-muted)]">
                  ({lastResult.fastestLap.Constructor.name}) &bull; Lap {lastResult.fastestLap.FastestLap?.lap}
                </span>
              </div>
            </div>

            <div className="mt-2 sm:mt-0 font-mono font-black text-sm text-[var(--timing-purple)] tabular-nums">
              {lastResult.fastestLap.FastestLap?.Time.time}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
