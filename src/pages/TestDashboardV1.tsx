import React, { useEffect, useState } from 'react'
import { Header } from '@/features/dashboard-v1/Header'
import { DashboardHero } from '@/features/dashboard-v1/DashboardHero'
import { StickyNav } from '@/features/dashboard-v1/StickyNav'
import { LatestResultSection } from '@/features/dashboard-v1/LatestResultSection'
import { StandingsSection } from '@/features/dashboard-v1/StandingsSection'
import { CalendarSection } from '@/features/dashboard-v1/CalendarSection'
import { DriversSection } from '@/features/dashboard-v1/DriversSection'
import { Footer } from '@/features/dashboard-v1/Footer'
import '@/features/dashboard-v1/dashboard-v2.css'

export const TestDashboardV1: React.FC = () => {
  const [activeSection, setActiveSection] = useState('next-race')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the visible section that is intersecting most
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

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [activeSection])

  return (
    <div data-dv2 className="flex flex-col min-h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      <Header />
      <main className="flex-1 flex flex-col">
        <DashboardHero id="next-race" />
        <StickyNav activeSection={activeSection} />
        
        <div className="max-w-[1280px] mx-auto w-full px-5 md:px-8 lg:px-12 pb-32">
          <LatestResultSection id="results" />
          <StandingsSection id="standings" />
          <CalendarSection id="calendar" />
          <DriversSection id="drivers" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
