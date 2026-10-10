import React, { useState } from 'react'
import { useDriverStandings, useConstructorStandings, useLastRaceResult } from '@/api/useF1Data'
import { getTeamMeta } from '@/lib/teams'
import { Section, SectionHeading, RowSkeleton, QuietError, Figure, Label } from './primitives'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import { teamLogos } from '@/lib/teamLogos'

export const StandingsSection: React.FC<{ id?: string }> = ({ id }) => {
  const { data: drivers, isLoading: dLoading, isError: dError, refetch: dRefetch } = useDriverStandings()
  const { data: teams, isLoading: tLoading, isError: tError, refetch: tRefetch } = useConstructorStandings()
  const { data: lastRace, isLoading: rLoading, isError: rError, refetch: rRefetch } = useLastRaceResult()
  
  const [tab, setTab] = useState<'results' | 'drivers' | 'constructors'>('results')
  const [expanded, setExpanded] = useState(false)

  if (dLoading || tLoading || rLoading) {
    return (
      <div className="mt-12 w-full" id={id || 'standings'}>
        <RowSkeleton rows={5} />
      </div>
    )
  }

  if (dError || !drivers || tError || !teams || rError || !lastRace) {
    return (
      <div className="mt-12 w-full" id={id || 'standings'}>
        <QuietError message="Could not load standings." onRetry={() => { dRefetch(); tRefetch(); rRefetch(); }} />
      </div>
    )
  }

  let items: any[] = []
  if (tab === 'drivers') items = drivers
  else if (tab === 'constructors') items = teams
  else if (tab === 'results') items = lastRace.results

  const displayItems = expanded ? items : items.slice(0, 5)

  // Determine leader points for the gap bar
  let leaderPoints = 0
  if (items.length > 0) {
    leaderPoints = Number(items[0].points)
  }

  return (
    <div id={id || 'standings'} className="w-full h-full flex flex-col">
      <div className="flex justify-start mb-6 lg:mt-2">
        <div className="flex bg-[var(--surface-1)] p-1 rounded-full border border-[var(--border-subtle)] relative">
          {(['results', 'drivers', 'constructors'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative px-4 py-1.5 md:px-5 md:py-2 text-[13px] font-semibold rounded-full transition-colors cursor-pointer capitalize z-10 outline-none",
                tab === t ? 'text-[var(--bg)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              {tab === t && (
                <motion.div
                  layoutId="standings-tab-indicator"
                  className="absolute inset-0 bg-[var(--text)] rounded-full -z-10"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="border-t border-[var(--border-subtle)]">
        <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
          <Label className="w-8">Pos</Label>
          <Label className="flex-1">Name</Label>
          <Label className="w-16 text-right hidden sm:block">Gap</Label>
          <Label className="w-16 text-right ml-4">Pts</Label>
        </div>
        
        <div className="relative min-h-[250px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div 
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="divide-y divide-[var(--border-subtle)] flex flex-col"
            >
              {displayItems.map((item, idx) => {
                const isDriver = 'driver' in item || 'Driver' in item
                const isResult = 'Driver' in item
                
                const driverObj = isResult ? item.Driver : item.driver
                const teamObj = isResult ? item.Constructor : item.constructor
                
                const idKey = isDriver ? driverObj.driverId : teamObj.constructorId
                const teamMeta = getTeamMeta(teamObj.constructorId)
                const pts = Number(item.points)
                const gap = leaderPoints - pts
                const percent = leaderPoints > 0 ? (pts / leaderPoints) * 100 : 0
                
                return (
                  <motion.div 
                    key={idKey}
                    layout="position"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group relative flex items-center px-4 py-3 hover:bg-[var(--surface-1)] transition-colors duration-150 overflow-hidden"
                  >
                    {/* Hover edge */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 -translate-x-full group-hover:translate-x-0 transition-transform duration-150 ease-[var(--ease-out)]"
                      style={{ backgroundColor: teamMeta.color }}
                      aria-hidden="true"
                    />
                    
                    {/* Points Bar Background */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                      <motion.div 
                        className="h-full origin-left"
                        style={{ backgroundColor: teamMeta.color }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: percent / 100 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>

                    <div className="w-8 flex items-center relative z-10">
                      <Figure className="text-[14px] font-medium text-[var(--text-muted)]">
                        {item.position}
                      </Figure>
                    </div>
                    
                    <div className="flex-1 flex items-center relative z-10 gap-3">
                      <div className="flex flex-col justify-center">
                        <span className="font-semibold text-[15px]">
                          {isDriver ? `${driverObj.givenName} ` : ''}
                          <span className="uppercase">{isDriver ? driverObj.familyName : teamObj.name}</span>
                        </span>
                        {isDriver && (
                          <div className="flex items-center gap-2">
                            {teamLogos[teamMeta.id] && (
                              <img src={teamLogos[teamMeta.id]} alt={teamMeta.name} className="h-3 w-auto object-contain" />
                            )}
                            <span className="text-[12px] text-[var(--text-muted)] truncate block" title={teamObj.name}>
                              {teamObj.name}
                            </span>
                          </div>
                        )}
                        {!isDriver && (
                          <div className="flex items-center gap-2 mt-1">
                            {teamLogos[teamMeta.id] && (
                              <img src={teamLogos[teamMeta.id]} alt={teamMeta.name} className="h-4 w-auto object-contain" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-16 text-right hidden sm:block relative z-10">
                      <Figure className="text-[13px] text-[var(--text-muted)]">
                        {gap > 0 ? `-${gap}` : '-'}
                      </Figure>
                    </div>
                    
                    <div className="w-16 text-right ml-4 relative z-10">
                      <Figure className="text-[15px] font-bold">
                        {item.points}
                      </Figure>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {!expanded && items.length > 5 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setExpanded(true)}
            className="dv2-link text-[13px] font-semibold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2 px-4"
          >
            View full standings
          </button>
        </div>
      )}
      {expanded && (
        <div className="mt-4 flex justify-center">
           <Link
            to={tab === 'drivers' ? '/drivers' : tab === 'constructors' ? '/teams' : '/calendar'}
            className="dv2-link text-[13px] font-semibold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2 px-4"
          >
            Go to full {tab} page
          </Link>
        </div>
      )}
    </div>
  )
}
