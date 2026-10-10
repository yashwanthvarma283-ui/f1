import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { DriverStandingItem, ConstructorStandingItem } from '@/api/types'
import { Tabs } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { getTeamMeta } from '@/lib/teams'
import { CountryFlag } from '@/lib/flags'
import { ArrowUpRight, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { teamLogos } from '@/lib/teamLogos'

interface StandingsSnapshotProps {
  drivers: DriverStandingItem[]
  constructors: ConstructorStandingItem[]
  isLoading?: boolean
  error?: Error | null
}

export const StandingsSnapshot: React.FC<StandingsSnapshotProps> = ({
  drivers,
  constructors,
  isLoading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers')

  const topDrivers = drivers.slice(0, 5)
  const topConstructors = constructors.slice(0, 5)
  const leaderDriverPoints = topDrivers[0]?.points || 1
  const leaderConstructorPoints = topConstructors[0]?.points || 1

  if (isLoading) {
    return (
      <section className="py-12 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-48 rounded-lg" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return null
  }

  const tabs = [
    { id: 'drivers' as const, label: 'Drivers Championship', count: 'TOP 5' },
    { id: 'constructors' as const, label: 'Constructors Championship', count: 'TOP 5' },
  ]

  return (
    <section className="py-12 border-b border-[var(--border)] bg-[var(--surface-1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-text)] font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              CHAMPIONSHIP TELEMETRY
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[var(--text)] uppercase tracking-[0.01em] mt-1">
              Standings Snapshot
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id)}
              layoutId="standingsActiveTab"
            />
          </div>
        </div>

        {/* Tab Content List with 4px Left Team Color Bar & Thin Red Top-Edge Accent */}
        <div className="f1-card-accent rounded-xl border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden divide-y divide-[var(--border)] shadow-[var(--card-shadow)]">
          <AnimatePresence mode="wait">
            {activeTab === 'drivers' ? (
              <motion.div
                key="drivers-list"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {topDrivers.map((item) => {
                  const team = getTeamMeta(item.constructor.constructorId)
                  const isLeader = item.position === 1
                  const pointsRatio =
                    leaderDriverPoints > 0
                      ? Math.min(1, Math.max(0.04, Number(item.points) / leaderDriverPoints))
                      : 0

                  return (
                    <div
                      key={item.driver.driverId}
                      className="group flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-[var(--surface-3)] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {/* Left: Position, 4px Team Bar, Driver Name */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-[170px] sm:min-w-[210px]">
                        <span
                          className={cn(
                            'font-mono text-sm sm:text-base font-black w-6 text-center tabular-nums',
                            isLeader ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'
                          )}
                        >
                          P{item.position}
                        </span>

                        {/* Team colour bar (4px left edge) using 2026 team colours */}
                        <div
                          className="w-1 h-9 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: team.color }}
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm sm:text-base text-[var(--text)] tracking-[0.01em]">
                              {item.driver.givenName}{' '}
                              <span className="uppercase font-bold tracking-[0.01em]">{item.driver.familyName}</span>
                            </span>
                            {item.driver.code && (
                              <span className="font-mono text-xs text-[var(--text-muted)]">
                                ({item.driver.code})
                              </span>
                            )}
                            <CountryFlag country={item.driver.nationality} className="w-3.5 h-2.5 rounded-xs" />
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">{team.name}</div>
                        </div>
                      </div>

                      {/* Middle: Horizontal Points Bar scaled to leader points (animated with scaleX on load) + Gap to leader */}
                      <div className="hidden md:flex items-center flex-1 mx-4 lg:mx-8 gap-3 min-w-0">
                        <div className="flex-1 h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              width: `${(pointsRatio * 100).toFixed(1)}%`,
                              backgroundColor: team.color,
                              transformOrigin: 'left',
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-xs font-mono shrink-0 tabular-nums font-semibold w-24 text-right',
                            isLeader ? 'text-[var(--timing-green)]' : 'text-[var(--text-muted)]'
                          )}
                        >
                          {isLeader ? 'LEADER' : `-${item.gapToLeader} PTS`}
                        </span>
                      </div>

                      {/* Right: Wins, Mobile Gap, Points with Scroll Count-Up */}
                      <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs text-right shrink-0">
                        {item.wins > 0 && (
                          <div className="hidden sm:block text-[var(--text-muted)] text-[11px]">
                            <span className="text-[var(--text)] font-bold">
                              <AnimatedCounter value={item.wins} />
                            </span>{' '}
                            {item.wins === 1 ? 'WIN' : 'WINS'}
                          </div>
                        )}

                        {/* On mobile screens (<md), show compact gap */}
                        <div className="md:hidden w-16 text-right">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">GAP</span>
                          <span
                            className={cn(
                              'text-xs font-semibold tabular-nums',
                              isLeader ? 'text-[var(--timing-green)]' : 'text-[var(--text-muted)]'
                            )}
                          >
                            {isLeader ? 'LEAD' : `-${item.gapToLeader}`}
                          </span>
                        </div>

                        <div className="w-16 sm:w-20">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">PTS</span>
                          <span className="text-sm sm:text-base font-black text-[var(--text)] tabular-nums">
                            <AnimatedCounter value={Number(item.points) || 0} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div
                key="constructors-list"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {topConstructors.map((item) => {
                  const team = getTeamMeta(item.constructor.constructorId)
                  const isLeader = item.position === 1
                  const pointsRatio =
                    leaderConstructorPoints > 0
                      ? Math.min(1, Math.max(0.04, Number(item.points) / leaderConstructorPoints))
                      : 0

                  return (
                    <div
                      key={item.constructor.constructorId}
                      className="group flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-[var(--surface-3)] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {/* Left: Position, 4px Team Bar, Constructor Name */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-[170px] sm:min-w-[210px]">
                        <span
                          className={cn(
                            'font-mono text-sm sm:text-base font-black w-6 text-center tabular-nums',
                            isLeader ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'
                          )}
                        >
                          P{item.position}
                        </span>

                        {/* Team colour bar (4px left edge) using 2026 team colours */}
                        <div
                          className="w-1 h-9 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: team.color }}
                        />

                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-semibold text-sm sm:text-base text-[var(--text)] tracking-[0.01em]">
                              {item.constructor.name}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] font-mono">
                              {item.constructor.nationality}
                            </div>
                          </div>
                          {teamLogos[team.id] && (
                            <img src={teamLogos[team.id]} alt={team.name} className={cn("w-auto object-contain hidden sm:block", team.id === 'mclaren' ? "h-4 sm:h-5" : "h-6 sm:h-7")} />
                          )}
                        </div>
                      </div>

                      {/* Middle: Horizontal Points Bar scaled to leader points (animated with scaleX on load) + Gap to leader */}
                      <div className="hidden md:flex items-center flex-1 mx-4 lg:mx-8 gap-3 min-w-0">
                        <div className="flex-1 h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              width: `${(pointsRatio * 100).toFixed(1)}%`,
                              backgroundColor: team.color,
                              transformOrigin: 'left',
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-xs font-mono shrink-0 tabular-nums font-semibold w-24 text-right',
                            isLeader ? 'text-[var(--timing-green)]' : 'text-[var(--text-muted)]'
                          )}
                        >
                          {isLeader ? 'LEADER' : `-${item.gapToLeader} PTS`}
                        </span>
                      </div>

                      {/* Right: Wins, Mobile Gap, Points with Scroll Count-Up */}
                      <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs text-right shrink-0">
                        {item.wins > 0 && (
                          <div className="hidden sm:block text-[var(--text-muted)] text-[11px]">
                            <span className="text-[var(--text)] font-bold">
                              <AnimatedCounter value={item.wins} />
                            </span>{' '}
                            {item.wins === 1 ? 'WIN' : 'WINS'}
                          </div>
                        )}

                        {/* On mobile screens (<md), show compact gap */}
                        <div className="md:hidden w-16 text-right">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">GAP</span>
                          <span
                            className={cn(
                              'text-xs font-semibold tabular-nums',
                              isLeader ? 'text-[var(--timing-green)]' : 'text-[var(--text-muted)]'
                            )}
                          >
                            {isLeader ? 'LEAD' : `-${item.gapToLeader}`}
                          </span>
                        </div>

                        <div className="w-16 sm:w-20">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">PTS</span>
                          <span className="text-sm sm:text-base font-black text-[var(--text)] tabular-nums">
                            <AnimatedCounter value={Number(item.points) || 0} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Full Standings Link */}
        <div className="flex justify-end">
          <Link
            to={activeTab === 'drivers' ? '/drivers' : '/teams'}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group"
          >
            <span>View Full {activeTab === 'drivers' ? 'Drivers' : 'Constructors'} Championship Table</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
