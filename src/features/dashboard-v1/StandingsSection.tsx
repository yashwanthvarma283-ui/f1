import React, { useState } from 'react'
import { useDriverStandings, useConstructorStandings } from '@/api/useF1Data'
import { getTeamMeta } from '@/lib/teams'
import { Section, SectionHeading, RowSkeleton, QuietError, Figure, Label } from './primitives'
import { cn } from '@/lib/utils'
import { teamLogos } from '@/lib/teamLogos'

export const StandingsSection: React.FC<{ id?: string }> = ({ id }) => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers')
  
  const driversQuery = useDriverStandings()
  const constructorsQuery = useConstructorStandings()
  
  const isLoading = activeTab === 'drivers' ? driversQuery.isLoading : constructorsQuery.isLoading
  const isError = activeTab === 'drivers' ? driversQuery.isError : constructorsQuery.isError
  
  const drivers = driversQuery.data?.slice(0, 10) || []
  const constructors = constructorsQuery.data || []

  return (
    <Section id={id || 'standings'}>
      <SectionHeading
        action={
          <div className="flex bg-[var(--surface-2)] p-1 rounded-full">
            <button
              onClick={() => setActiveTab('drivers')}
              className={cn(
                'dv2-press px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150',
                activeTab === 'drivers' ? 'bg-[var(--surface-3)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              Drivers
            </button>
            <button
              onClick={() => setActiveTab('constructors')}
              className={cn(
                'dv2-press px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150',
                activeTab === 'constructors' ? 'bg-[var(--surface-3)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              Teams
            </button>
          </div>
        }
      >
        Standings
      </SectionHeading>
      
      {isLoading ? (
        <RowSkeleton rows={10} className="mt-8 border-t border-[var(--border-subtle)]" />
      ) : isError ? (
        <QuietError message="Could not load standings." onRetry={() => activeTab === 'drivers' ? driversQuery.refetch() : constructorsQuery.refetch()} />
      ) : (
        <div className="mt-8 border-t border-[var(--border-subtle)]">
          <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
            <Label className="w-12">Pos</Label>
            <Label className="flex-1">{activeTab === 'drivers' ? 'Driver' : 'Constructor'}</Label>
            {activeTab === 'drivers' && <Label className="w-32 hidden sm:block">Team</Label>}
            <Label className="w-16 text-right ml-4">Pts</Label>
          </div>
          
          <div className="divide-y divide-[var(--border-subtle)]">
            {activeTab === 'drivers' ? (
              drivers.map((item) => {
                const teamMeta = getTeamMeta(item.constructor.constructorId)
                return (
                  <div key={item.driver.driverId} className="group flex items-center px-4 py-3 hover:bg-[var(--surface-1)] transition-colors duration-150">
                    <div className="w-12 flex items-center gap-2">
                      <span className="block w-1 h-6 shrink-0 rounded-[1px]" style={{ backgroundColor: teamMeta.color }} aria-hidden="true" />
                      <Figure className={cn('text-[15px]', item.position <= 3 ? 'font-bold' : 'font-medium')}>{item.position}</Figure>
                    </div>
                    <div className="flex-1 font-semibold text-[15px]">
                      {item.driver.givenName} <span className="uppercase">{item.driver.familyName}</span>
                    </div>
                    <div className="w-32 hidden sm:block">
                      <span className="text-[14px] text-[var(--text-muted)] truncate block" title={item.constructor.name}>{item.constructor.name}</span>
                    </div>
                    <div className="w-16 text-right ml-4">
                      <Figure className={cn('text-[15px]', item.position <= 3 ? 'font-bold' : 'font-medium')}>{item.points}</Figure>
                    </div>
                  </div>
                )
              })
            ) : (
              constructors.map((item) => {
                const teamMeta = getTeamMeta(item.constructor.constructorId)
                return (
                  <div key={item.constructor.constructorId} className="group flex items-center px-4 py-3 hover:bg-[var(--surface-1)] transition-colors duration-150">
                    <div className="w-12 flex items-center gap-2">
                      <span className="block w-1 h-6 shrink-0 rounded-[1px]" style={{ backgroundColor: teamMeta.color }} aria-hidden="true" />
                      <Figure className={cn('text-[15px]', item.position <= 3 ? 'font-bold' : 'font-medium')}>{item.position}</Figure>
                    </div>
                    <div className="flex-1 font-semibold text-[15px] flex items-center gap-3">
                      {item.constructor.name}
                      {teamLogos[teamMeta.id] && (
                        <img src={teamLogos[teamMeta.id]} alt={teamMeta.name} className={cn("w-auto object-contain", teamMeta.id === 'mclaren' ? "h-3 sm:h-4" : "h-5 sm:h-6")} />
                      )}
                    </div>
                    <div className="w-16 text-right ml-4">
                      <Figure className={cn('text-[15px]', item.position <= 3 ? 'font-bold' : 'font-medium')}>{item.points}</Figure>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </Section>
  )
}
