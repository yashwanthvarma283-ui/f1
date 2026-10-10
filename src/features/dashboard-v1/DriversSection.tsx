import React from 'react'
import { useDriverStandings } from '@/api/useF1Data'
import { getTeamMeta } from '@/lib/teams'
import { CountryFlag } from '@/lib/flags'
import { Section, SectionHeading, QuietError, Figure } from './primitives'

export const DriversSection: React.FC<{ id?: string }> = ({ id }) => {
  const { data: drivers, isLoading, isError, refetch } = useDriverStandings()

  if (isLoading) {
    return (
      <Section id={id || 'drivers'}>
        <SectionHeading>Drivers</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-8 border-t border-[var(--border-subtle)] pt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-[var(--surface-1)] rounded-[4px] border border-[var(--border-subtle)] animate-pulse" />
          ))}
        </div>
      </Section>
    )
  }

  if (isError || !drivers) {
    return (
      <Section id={id || 'drivers'}>
        <SectionHeading>Drivers</SectionHeading>
        <QuietError message="Could not load drivers." onRetry={refetch} />
      </Section>
    )
  }

  return (
    <Section id={id || 'drivers'}>
      <SectionHeading>Drivers</SectionHeading>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-8 border-t border-[var(--border-subtle)] pt-8">
        {drivers.map((item) => {
          const teamMeta = getTeamMeta(item.constructor.constructorId)
          return (
            <div 
              key={item.driver.driverId} 
              className="group relative flex flex-col justify-between h-24 p-4 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-[4px] overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:shadow-md hover:border-[var(--border)] cursor-pointer"
            >
              <div 
                className="absolute top-0 right-0 bottom-0 w-[4px] transition-all duration-150 group-hover:w-[6px]" 
                style={{ backgroundColor: teamMeta.color }} 
              />
              
              <div className="flex justify-between items-start pr-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px] leading-tight">
                    {item.driver.givenName} <span className="uppercase">{item.driver.familyName}</span>
                  </span>
                  <span className="text-[13px] text-[var(--text-muted)] mt-1 truncate max-w-[160px]" title={item.constructor.name}>
                    {item.constructor.name}
                  </span>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <CountryFlag country={item.driver.nationality} className="w-5 h-5 rounded-[2px]" />
                </div>
              </div>
              
              <div className="flex justify-between items-end pr-4">
                <Figure className="text-[18px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors duration-150">
                  {item.driver.permanentNumber || '—'}
                </Figure>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
