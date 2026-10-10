import React, { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'motion/react'
import { Header } from '@/features/dashboard-v2/Header'
import { DashboardHero } from '@/features/dashboard-v2/DashboardHero'
import { LatestResultSection } from '@/features/dashboard-v2/LatestResultSection'
import { CalendarSection } from '@/features/dashboard-v2/CalendarSection'
import { DriversSection } from '@/features/dashboard-v2/DriversSection'
import { Footer } from '@/features/dashboard-v2/Footer'

export const TestDashboardV2: React.FC = () => {
  const { scrollY } = useScroll()
  const [showTop, setShowTop] = useState(false)
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    setShowTop(latest > 500)
  })

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      <Header />
      
      {/* Scroll Progress Line */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--accent)] z-[60] origin-left"
        style={{ scaleX: useScroll().scrollYProgress }}
      />
      
      <main className="flex-1 flex flex-col">
        <DashboardHero id="next-race" />
        
        {/* Chequered Divider */}
        <div className="w-full h-2 checkered-divider opacity-20" />
        
        <div className="max-w-[1560px] mx-auto w-full px-5 md:px-8 lg:px-12 pb-12 mt-8 lg:mt-12">
          
          <LatestResultSection id="results" />
          
          <CalendarSection id="calendar" />
          <DriversSection id="drivers" />
        </div>
      </main>
      <Footer />
      
      {/* Back to top control */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1 transition-all"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showTop ? 1 : 0, y: showTop ? 0 : 20, pointerEvents: showTop ? 'auto' : 'none' }}
        aria-label="Back to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </motion.button>
    </div>
  )
}
