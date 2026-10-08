import React from 'react'
import {
  DriverSessionInfo,
  RaceResultEntry,
  LapData,
  LapPositionSnapshot,
  StintData,
  PitStopData,
  DriverTyreLapState,
  DriverRaceSummaryStats,
  RaceControlMessage,
  WeatherSnapshot,
} from '@/types/data'
import { F1InsightsView, InsightTabId } from './F1InsightsView'

export interface F1InsightsModalProps {
  isOpen: boolean
  onClose: () => void
  currentLap: number
  totalLaps: number
  selectedDriver: string
  onSelectDriver: (code: string) => void
  drivers: DriverSessionInfo[]
  results: RaceResultEntry[]
  laps?: LapData[]
  positionsByLap?: LapPositionSnapshot[]
  gapsByLap?: any[]
  stints?: StintData[]
  pitstops?: PitStopData[]
  tyreDegradation?: DriverTyreLapState[]
  driverStats?: DriverRaceSummaryStats[]
  raceControl?: RaceControlMessage[]
  weather?: WeatherSnapshot[]
  circuitId?: string
  circuitName?: string
  initialTab?: InsightTabId
}

export const F1InsightsModal: React.FC<F1InsightsModalProps> = ({
  isOpen,
  onClose,
  currentLap,
  totalLaps,
  selectedDriver,
  onSelectDriver,
  drivers,
  results,
  laps = [],
  positionsByLap = [],
  gapsByLap = [],
  stints = [],
  pitstops = [],
  tyreDegradation = [],
  driverStats = [],
  raceControl = [],
  weather = [],
  circuitId,
  circuitName,
  initialTab = 'driver_telemetry',
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <F1InsightsView
        currentLap={currentLap}
        totalLaps={totalLaps}
        selectedDriver={selectedDriver}
        onSelectDriver={onSelectDriver}
        drivers={drivers}
        results={results}
        laps={laps}
        positionsByLap={positionsByLap}
        gapsByLap={gapsByLap}
        stints={stints}
        pitstops={pitstops}
        tyreDegradation={tyreDegradation}
        driverStats={driverStats}
        raceControl={raceControl}
        weather={weather}
        circuitId={circuitId}
        circuitName={circuitName}
        isEmbedded={false}
        onClose={onClose}
        initialTab={initialTab}
      />
    </div>
  )
}
