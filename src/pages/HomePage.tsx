import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  useSchedule,
  useLastRaceResult,
  useDriverStandings,
  useConstructorStandings,
  useAvailableSeasons,
  useLiveStatus,
} from '@/api/useF1Data'
import { SessionService } from '@/api/sessionService'
import { HeroNextRace } from '@/features/hero/HeroNextRace'
import { LatestResult } from '@/features/results/LatestResult'
import { StandingsSnapshot } from '@/features/standings/StandingsSnapshot'
import { SeasonStrip } from '@/features/season/SeasonStrip'
import { QuickDriverLookup } from '@/features/lookup/QuickDriverLookup'

export const HomePage: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState('current')
  const shouldReduceMotion = useReducedMotion()
  const navigate = useNavigate()

  // Queries
  const scheduleQuery = useSchedule(selectedSeason)
  const lastResultQuery = useLastRaceResult()
  const driverStandingsQuery = useDriverStandings(selectedSeason)
  const constructorStandingsQuery = useConstructorStandings(selectedSeason)
  const seasonsQuery = useAvailableSeasons()

  // Find next upcoming race
  const nextRace = useMemo(() => {
    return SessionService.findNextRace(scheduleQuery.data?.races || [])
  }, [scheduleQuery.data])

  // Live status for the next race
  const liveStatusQuery = useLiveStatus(
    nextRace?.Circuit.circuitName,
    nextRace?.Circuit.Location.country
  )

  // Championship leader driver ID
  const leaderDriverId = useMemo(() => {
    const top = driverStandingsQuery.data?.[0]
    return top?.driver.driverId
  }, [driverStandingsQuery.data])

  // Page load: staggered reveal (60ms stagger, 12px translateY + fade)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: 0.04,
      },
    },
  }

  const sectionVariants = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1] as const, // --ease-out
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col"
    >
      {/* 1. Hero Section: Next Race & Live Countdown */}
      <motion.div variants={sectionVariants}>
        <div className="w-full flex justify-end p-4 lg:px-8">
          <div className="flex items-center gap-2 bg-[var(--surface-2)] p-2 rounded-lg border border-[var(--surface-3)]">
            <span className="text-sm text-[var(--text-2)] font-medium">Test Dashboard:</span>
            <select
              className="bg-[var(--surface-1)] text-[var(--text-1)] border border-[var(--surface-3)] rounded px-3 py-1 text-sm outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              onChange={(e) => {
                if (e.target.value) {
                  navigate(e.target.value)
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Select version</option>
              <option value="/test/dashboard/v1">Version 1</option>
              <option value="/test/dashboard/v2">Version 2</option>
            </select>
          </div>
        </div>
        <HeroNextRace
          race={nextRace}
          liveStatus={liveStatusQuery.data || { isLive: false, isReplay: false }}
          isLoading={scheduleQuery.isLoading}
          error={scheduleQuery.error}
          onRetry={() => scheduleQuery.refetch()}
          drivers={driverStandingsQuery.data || []}
          lastResult={lastResultQuery.data || null}
        />
      </motion.div>

      {/* 2. Latest Result: Last GP Podium & DHL Fastest Lap */}
      <motion.div variants={sectionVariants}>
        <LatestResult
          lastResult={lastResultQuery.data || null}
          isLoading={lastResultQuery.isLoading}
          error={lastResultQuery.error}
        />
      </motion.div>

      {/* 3. Standings Snapshot: Top 5 Drivers & Constructors with tabs */}
      <motion.div variants={sectionVariants}>
        <StandingsSnapshot
          drivers={driverStandingsQuery.data || []}
          constructors={constructorStandingsQuery.data || []}
          isLoading={driverStandingsQuery.isLoading || constructorStandingsQuery.isLoading}
          error={driverStandingsQuery.error}
        />
      </motion.div>

      {/* 4. Season Strip: Horizontal round scroll with year switcher */}
      <motion.div variants={sectionVariants}>
        <SeasonStrip
          races={scheduleQuery.data?.races || []}
          currentSeason={selectedSeason === 'current' ? (scheduleQuery.data?.season || String(new Date().getFullYear())) : selectedSeason}
          availableSeasons={seasonsQuery.data || Array.from({ length: 7 }, (_, i) => String(new Date().getFullYear() - i))}
          onSeasonChange={(year) => setSelectedSeason(year)}
          nextRoundNumber={nextRace?.round}
          isLoading={scheduleQuery.isLoading}
        />
      </motion.div>

      {/* 5. Quick Driver Lookup: Fast autocomplete & featured competitors */}
      <motion.div variants={sectionVariants}>
        <QuickDriverLookup leaderDriverId={leaderDriverId} />
      </motion.div>
    </motion.div>
  )
}
