import React, { useEffect, useState } from 'react'
import { Header } from '@/features/dashboard-v1/Header'
import { StickyNav } from '@/features/dashboard-v1/StickyNav'
import { DashboardHero } from '@/features/dashboard-v2/DashboardHero'
import { LatestResultSection } from '@/features/dashboard-v2/LatestResultSection'
import { CalendarSection } from '@/features/dashboard-v2/CalendarSection'
import { DriversSection } from '@/features/dashboard-v2/DriversSection'
import { Footer } from '@/components/layout/Footer'

export const TestDashboardV2: React.FC = () => {
  const [activeSection, setActiveSection] = useState('next-race')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestMatch = activeSection
        let highestRatio = 0
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio
            bestMatch = entry.target.id
          }
        })
        if (highestRatio > 0 && bestMatch !== activeSection) {
          setActiveSection(bestMatch)
        }
      },
      { rootMargin: '-120px 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    const sections = document.querySelectorAll('section[id], div#standings')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [activeSection])

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <DashboardHero id="next-race" />
        <StickyNav activeSection={activeSection} />
        
        <div className="max-w-[1560px] mx-auto w-full px-5 md:px-8 lg:px-12 pb-12 mt-4 lg:mt-6">
          <LatestResultSection id="results" />
          
          <CalendarSection id="calendar" />
          <DriversSection id="drivers" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
