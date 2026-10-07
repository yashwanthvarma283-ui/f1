import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ThemeProvider } from '@/context/ThemeContext'
import { TimezoneProvider } from '@/context/TimezoneContext'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { CalendarPage } from '@/pages/CalendarPage'
import { RacePage } from '@/pages/RacePage'
import { DriversPage, TeamsPage } from '@/pages/Placeholders'

// Configure TanStack Query with 24h cache persistence in localStorage
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'PITWALL_QUERY_OFFLINE_CACHE',
})

/**
 * Animated route transitions:
 * Crossfade with slight slide so Home -> Calendar -> Drivers -> Teams feels continuous.
 */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
        className="w-full flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/race/:id" element={<RacePage />} />
          {/* Fallback to Home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export const App: React.FC = () => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <ThemeProvider>
        <TimezoneProvider>
          <BrowserRouter>
            <Layout>
              <AnimatedRoutes />
            </Layout>
          </BrowserRouter>
        </TimezoneProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  )
}

export default App
