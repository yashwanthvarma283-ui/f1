import React, { useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { staticDataClient } from '@/api/staticDataClient'
import { RaceHeader, RaceTabId } from '@/features/race/RaceHeader'
import { OverviewTab } from '@/features/race/OverviewTab'
import { RaceReplayView } from '@/features/race/RaceReplayView'
import { DriversTab } from '@/features/race/DriversTab'
import { LapExplorer } from '@/features/race/LapExplorer'
import { TyresStrategyTab } from '@/features/race/TyresStrategyTab'
import { PacePositionsTab } from '@/features/race/PacePositionsTab'
import { TeamRadioTab } from '@/features/race/TeamRadioTab'
import { CommentaryTab } from '@/features/race/CommentaryTab'
import { UpcomingRaceView } from '@/features/race/UpcomingRaceView'
import { F1InsightsView } from '@/features/race/F1InsightsView'
import { Skeleton } from '@/components/ui/Skeleton'

export const RacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const shouldReduceMotion = useReducedMotion()

  const initialSession = searchParams.get('session') || 'Race'
  const initialTab = (searchParams.get('tab') as RaceTabId) || 'overview'

  const [activeSession, setActiveSession] = useState<string>(initialSession)
  const [activeTab, setActiveTab] = useState<RaceTabId>(initialTab)

  // Parse year and round/slug from id param e.g. "2024-01-sakhir", "2024-1", "01_sakhir"
  const { year, roundOrSlug } = useMemo(() => {
    const raw = id || '2024-1'
    const parts = raw.split('-')
    const parsedYear = parseInt(parts[0], 10)

    if (!isNaN(parsedYear) && parsedYear >= 1950 && parsedYear <= 2030) {
      const remaining = parts.slice(1).join('-') || '1'
      return { year: parsedYear, roundOrSlug: remaining }
    }

    return { year: 2024, roundOrSlug: raw }
  }, [id])

  // 1. Race detail meta (circuit info, schedule, coordinates)
  const metaQuery = useQuery({
    queryKey: ['race-meta', year, roundOrSlug],
    queryFn: () => staticDataClient.getRaceMeta(year, roundOrSlug),
    staleTime: 1000 * 60 * 60,
  })

  // 2. Race coverage report (validation score, mapped radio/flags percentage)
  const coverageQuery = useQuery({
    queryKey: ['race-coverage', year, roundOrSlug],
    queryFn: () => staticDataClient.getRaceCoverage(year, roundOrSlug),
    staleTime: 1000 * 60 * 60,
  })

  // 3. Full session dataset (results, laps, stints, radio, commentary, weather, etc.)
  const sessionQuery = useQuery({
    queryKey: ['session-dataset', year, roundOrSlug, activeSession.toLowerCase()],
    queryFn: () =>
      staticDataClient.getSessionDataset(year, roundOrSlug, activeSession.toLowerCase()),
    staleTime: 1000 * 60 * 30,
  })

  const isLoading = metaQuery.isLoading || sessionQuery.isLoading
  const dataset = sessionQuery.data

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Race Header & Session Switcher */}
      <RaceHeader
        year={year}
        round={metaQuery.data?.round || 1}
        raceMeta={metaQuery.data || null}
        coverageReport={coverageQuery.data || null}
        activeSession={activeSession}
        onSessionChange={setActiveSession}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDatasetAvailable={Boolean(dataset?.isAvailable)}
        isHistoricalArchive={Boolean(dataset?.isHistoricalArchive)}
        dataSource={dataset?.dataSource}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        )}

        {/* Upcoming Race Experience (when static dataset not available yet) */}
        {!isLoading && (!dataset || !dataset.isAvailable) && (
          <UpcomingRaceView
            year={year}
            round={metaQuery.data?.round || 1}
            raceMeta={metaQuery.data || null}
          />
        )}

        {/* Tab Content for Completed / Active Races */}
        {!isLoading && dataset && dataset.isAvailable && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <OverviewTab
                  results={dataset.results}
                  drivers={dataset.drivers}
                  laps={dataset.laps}
                  weather={dataset.weather}
                  raceControl={dataset.raceControl}
                  overtakes={dataset.overtakes}
                  driverStats={dataset.driverStats}
                  isHistoricalArchive={dataset.isHistoricalArchive}
                  circuitId={metaQuery.data?.circuit?.id}
                  circuitName={metaQuery.data?.circuit?.name}
                  onOpenReplay={() => setActiveTab('replay')}
                  onOpenInsights={() => setActiveTab('insights')}
                />
              )}

              {activeTab === 'replay' && (
                <RaceReplayView
                  year={year}
                  circuitId={metaQuery.data?.circuit?.id}
                  circuitName={metaQuery.data?.circuit?.name}
                  sessionType={activeSession}
                  results={dataset.results}
                  drivers={dataset.drivers}
                  laps={dataset.laps}
                  positionsByLap={dataset.positionsByLap}
                  weather={dataset.weather}
                  raceControl={dataset.raceControl}
                  stints={dataset.stints}
                  driverStats={dataset.driverStats}
                  pitstops={dataset.pitstops}
                  tyreDegradation={dataset.tyreDegradation}
                />
              )}

              {activeTab === 'insights' && (
                <F1InsightsView
                  currentLap={dataset.laps?.length ? Math.min(25, Math.max(...dataset.laps.map((l) => l.lapNumber))) : 25}
                  totalLaps={dataset.results?.length ? Math.max(...dataset.results.map((r) => r.laps || 57)) : 57}
                  selectedDriver={dataset.results[0]?.driverCode || dataset.drivers[0]?.nameAcronym || 'VER'}
                  drivers={dataset.drivers}
                  results={dataset.results}
                  laps={dataset.laps}
                  positionsByLap={dataset.positionsByLap}
                  gapsByLap={dataset.gapsByLap}
                  stints={dataset.stints}
                  pitstops={dataset.pitstops}
                  tyreDegradation={dataset.tyreDegradation}
                  driverStats={dataset.driverStats}
                  raceControl={dataset.raceControl}
                  weather={dataset.weather}
                  circuitId={metaQuery.data?.circuit?.id}
                  circuitName={metaQuery.data?.circuit?.name}
                  isEmbedded={true}
                />
              )}

              {activeTab === 'drivers' && (
                <DriversTab
                  drivers={dataset.drivers}
                  driverStats={dataset.driverStats}
                  laps={dataset.laps}
                />
              )}

              {activeTab === 'lap-explorer' && (
                <LapExplorer
                  positionsByLap={dataset.positionsByLap}
                  lapFeed={dataset.lapFeed}
                  radioClips={dataset.radio}
                  raceControl={dataset.raceControl}
                  weather={dataset.weather}
                  drivers={dataset.drivers}
                  laps={dataset.laps}
                  pitstops={dataset.pitstops}
                />
              )}

              {activeTab === 'tyres-strategy' && (
                <TyresStrategyTab
                  stints={dataset.stints}
                  pitstops={dataset.pitstops}
                  tyreDegradation={dataset.tyreDegradation}
                  drivers={dataset.drivers}
                />
              )}

              {activeTab === 'pace-positions' && (
                <PacePositionsTab
                  positionsByLap={dataset.positionsByLap}
                  laps={dataset.laps}
                  drivers={dataset.drivers}
                  driverStats={dataset.driverStats}
                />
              )}

              {activeTab === 'radio' && (
                <TeamRadioTab
                  radioClips={dataset.radio}
                  drivers={dataset.drivers}
                />
              )}

              {activeTab === 'commentary' && (
                <CommentaryTab
                  lapFeed={dataset.lapFeed}
                  drivers={dataset.drivers}
                  raceName={metaQuery.data?.raceName}
                  year={year}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}
export default RacePage
