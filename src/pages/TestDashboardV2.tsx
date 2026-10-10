import React from 'react'
import { Header } from '@/features/dashboard-v2/Header'
import { DashboardHero } from '@/features/dashboard-v2/DashboardHero'
import { LatestResultSection } from '@/features/dashboard-v2/LatestResultSection'
import { StandingsSection } from '@/features/dashboard-v2/StandingsSection'
import { CalendarSection } from '@/features/dashboard-v2/CalendarSection'
import { DriversSection } from '@/features/dashboard-v2/DriversSection'
import { Footer } from '@/features/dashboard-v2/Footer'

export const TestDashboardV2: React.FC = () => {

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <DashboardHero id="next-race" />
        
        <div className="max-w-[1560px] mx-auto w-full px-5 md:px-8 lg:px-12 pb-12 mt-8 lg:mt-12">
          {/* Grid Layout (Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 lg:mt-8">
            <div className="lg:col-span-7">
              <LatestResultSection id="results" />
            </div>
            <div className="lg:col-span-5">
              <StandingsSection id="standings" />
            </div>
          </div>
          
          <CalendarSection id="calendar" />
          <DriversSection id="drivers" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
