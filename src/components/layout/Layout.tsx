import React from 'react'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'
import { Footer } from './Footer'
import { TimezoneBanner } from '@/components/timezone/TimezoneBanner'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg)] text-[var(--text)] antialiased transition-colors duration-200">
      <TimezoneBanner />
      <TopBar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  )
}
