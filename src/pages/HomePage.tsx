import React, { useState, useMemo } from 'react'
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
    return top?.driver.driverId || 'norris'
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
          currentSeason={selectedSeason === 'current' ? (scheduleQuery.data?.season || '2026') : selectedSeason}
          availableSeasons={seasonsQuery.data || ['2026', '2025', '2024', '2023', '2022', '2021', '2020']}
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
