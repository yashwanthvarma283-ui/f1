import React from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { DashboardHero } from '@/features/dashboard-v2/DashboardHero'
import { LatestResultSection } from '@/features/dashboard-v2/LatestResultSection'
import { CalendarSection } from '@/features/dashboard-v2/CalendarSection'
import { DriversSection } from '@/features/dashboard-v2/DriversSection'
import { Footer } from '@/components/layout/Footer'

export const TestDashboardV2: React.FC = () => {

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      <TopBar />
      
      <main className="flex-1 flex flex-col">
        <DashboardHero id="next-race" />
        
        <div className="max-w-[1560px] mx-auto w-full px-5 md:px-8 lg:px-12 pb-12 mt-8 lg:mt-12">
          <LatestResultSection id="results" />
          
          <CalendarSection id="calendar" />
          <DriversSection id="drivers" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
