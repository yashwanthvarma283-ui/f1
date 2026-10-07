import React from 'react'
import { Link } from 'react-router-dom'
import { DriverStandingItem, LastRaceResultPayload } from '@/api/types'
import { getTeamMeta } from '@/lib/teams'
import { Skeleton } from '@/components/ui/Skeleton'
import { CloudMoon, Trophy, Flag, Thermometer, Droplets, Wind, AlertCircle } from 'lucide-react'

interface WeekendIntelProps {
  circuitName?: string
  locality?: string
  drivers?: DriverStandingItem[]
  lastResult?: LastRaceResultPayload | null
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export const WeekendIntel: React.FC<WeekendIntelProps> = ({
  circuitName = 'Marina Bay',
  locality = 'Singapore',
  drivers = [],
  lastResult = null,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-end pt-1">
        <div className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--text-muted)] mb-2.5 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 items-stretch">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2.5 flex-1 min-h-[148px] h-full"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-5 w-36" />
              <div className="space-y-1.5 pt-1">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full pt-1">
        <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
            <AlertCircle className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>Telemetry intel temporarily unavailable</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs font-mono font-bold text-[var(--accent)] hover:underline cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  const top3Drivers = drivers.slice(0, 3)
  const podiumList = lastResult?.podium?.slice(0, 3) || (lastResult?.winner ? [lastResult.winner] : [])

  return (
    <div className="w-full h-full flex flex-col justify-end pt-1">
      {/* Section Header */}
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[var(--border)] mb-3">
        <span className="font-bold tracking-[0.01em] uppercase text-[var(--text-muted)]">
          WEEKEND INTEL &bull; {locality.toUpperCase()}
        </span>
        <span className="text-[var(--text-muted)] font-semibold text-xs tracking-[0.01em]">
          TELEMETRY BRIEF
        </span>
      </div>

      {/* 3-Column Intel Row (Weather, Championship Top 3, Last GP Podium) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 items-stretch">
        {/* Card 1: Track Conditions / Weather */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-[var(--card-shadow)] hover:border-[var(--text-muted)] transition-all flex flex-col justify-between flex-1 min-h-[148px] h-full">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-1.5">
              <span className="font-bold uppercase tracking-[0.01em] text-xs">WEATHER</span>
              <CloudMoon className="w-3.5 h-3.5 text-[var(--timing-yellow)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-black text-xl text-[var(--text)]">29&deg;C</span>
              <span className="text-xs font-mono text-[var(--text-muted)] font-medium">AIR</span>
              <span className="text-[var(--border)]">&bull;</span>
              <span className="font-mono font-bold text-sm text-[var(--timing-purple-text)]">34&deg;C</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">TRACK</span>
            </div>
            <div className="mt-2 text-xs font-sans text-[var(--text-muted)] flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono text-xs">
                <Droplets className="w-3 h-3 text-[var(--timing-green)]" />
                78% Hum.
              </span>
              <span className="flex items-center gap-1 font-mono text-xs">
                <Wind className="w-3 h-3 text-[var(--text-muted)]" />
                12 km/h
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono font-semibold">
            <span className="text-[var(--timing-green)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--timing-green)]" />
              DRY NIGHT RACE
            </span>
            <span className="text-[var(--text-muted)] text-xs">15% RAIN</span>
          </div>
        </div>

        {/* Card 2: Championship Top 3 */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-[var(--card-shadow)] hover:border-[var(--text-muted)] transition-all flex flex-col justify-between flex-1 min-h-[148px] h-full">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-1.5">
              <span className="font-bold uppercase tracking-[0.01em] text-xs">DRIVERS TOP 3</span>
              <Trophy className="w-3.5 h-3.5 text-[var(--timing-yellow)]" />
            </div>

            {top3Drivers.length > 0 ? (
              <div className="space-y-1">
                {top3Drivers.map((item, idx) => {
                  const meta = getTeamMeta(item.constructor?.constructorId)
                  return (
                    <div
                      key={item.driver.driverId}
                      className="flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-3.5 font-bold text-[var(--text-muted)] text-[11px]">
                          P{idx + 1}
                        </span>
                        <span
                          className="w-1 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-semibold text-[var(--text)] truncate text-xs tracking-[0.01em]">
                          {item.driver.familyName || item.driver.code}
                        </span>
                      </div>
                      <span className="font-bold text-[var(--text)] text-xs tabular-nums pl-2">
                        {item.points} <span className="text-xs font-normal text-[var(--text-muted)]">PTS</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-2 text-center text-xs font-mono text-[var(--text-muted)]">
                Season standings pending
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
            <Link
              to="/drivers"
              className="text-[var(--accent-text)] hover:underline font-bold tracking-[0.01em] text-xs"
            >
              Full Standings &rarr;
            </Link>
            <span className="text-[var(--text-muted)] text-xs font-semibold">2026 SEASON</span>
          </div>
        </div>

        {/* Card 3: Last Race Podium */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-[var(--card-shadow)] hover:border-[var(--text-muted)] transition-all flex flex-col justify-between flex-1 min-h-[148px] h-full">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-1.5">
              <span className="font-bold uppercase tracking-[0.01em] text-xs">LAST GP PODIUM</span>
              <Flag className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>

            {podiumList.length > 0 ? (
              <div className="space-y-1">
                {podiumList.slice(0, 3).map((result, idx) => {
                  const meta = getTeamMeta(result.Constructor?.constructorId)
                  const medals = ['🥇', '🥈', '🥉']
                  return (
                    <div
                      key={result.Driver?.driverId || idx}
                      className="flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs">{medals[idx] || `P${idx + 1}`}</span>
                        <span
                          className="w-1 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-semibold text-[var(--text)] truncate text-xs">
                          {result.Driver?.familyName || result.Driver?.code || 'Driver'}
                        </span>
                      </div>
                      <span className="text-[11px] font-sans text-[var(--text-muted)] truncate max-w-[70px]">
                        {result.Constructor?.name || 'Team'}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-2 text-center text-xs font-mono text-[var(--text-muted)]">
                No prior race podium
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[var(--text-muted)] truncate max-w-[130px]">
              {lastResult?.raceName?.replace('Grand Prix', 'GP') || 'Last Grand Prix'}
            </span>
            <span className="text-[var(--timing-green)] font-bold text-[11px]">
              OFFICIAL
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
