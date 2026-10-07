import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Activity,
  Radio,
  Sliders,
  Layers,
  Users,
  MessageSquare,
  BarChart3,
} from 'lucide-react'
import { CountryFlag } from '@/lib/flags'
import { Badge } from '@/components/ui/Badge'
import { useTimezone } from '@/context/TimezoneContext'
import { TimezoneSelector } from '@/components/timezone/TimezoneSelector'
import { RaceDetailMeta, RaceCoverageReport } from '@/types/data'

export type RaceTabId =
  | 'overview'
  | 'lap-explorer'
  | 'tyres-strategy'
  | 'pace-positions'
  | 'radio'
  | 'drivers'
  | 'commentary'

interface RaceHeaderProps {
  year: number
  round: number
  raceMeta: RaceDetailMeta | null
  coverageReport: RaceCoverageReport | null
  activeSession: string
  onSessionChange: (session: string) => void
  activeTab: RaceTabId
  onTabChange: (tab: RaceTabId) => void
  isDatasetAvailable: boolean
  isHistoricalArchive?: boolean
  dataSource?: 'fastf1' | 'jolpica' | 'none'
}

export const RACE_TABS: { id: RaceTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
  { id: 'lap-explorer', label: 'Lap Explorer', icon: <Sliders className="w-4 h-4" /> },
  { id: 'tyres-strategy', label: 'Tyres & Strategy', icon: <Layers className="w-4 h-4" /> },
  { id: 'pace-positions', label: 'Pace & Positions', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'radio', label: 'Team Radio', icon: <Radio className="w-4 h-4" /> },
  { id: 'drivers', label: 'Drivers', icon: <Users className="w-4 h-4" /> },
  { id: 'commentary', label: 'Commentary', icon: <MessageSquare className="w-4 h-4" /> },
]

export const RaceHeader: React.FC<RaceHeaderProps> = ({
  year,
  round,
  raceMeta,
  coverageReport,
  activeSession,
  onSessionChange,
  activeTab,
  onTabChange,
  isDatasetAvailable,
  isHistoricalArchive = false,
  dataSource = 'none',
}) => {
  const { timezoneAbbr, formatWeekendSpan } = useTimezone()

  const overallCoverage =
    coverageReport?.sessions?.[activeSession]?.overallCompletenessPercent ||
    coverageReport?.sessions?.['Race']?.overallCompletenessPercent ||
    98

  const availableSessions = raceMeta?.schedule
    ? Object.keys(raceMeta.schedule)
    : ['Race']

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface-1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 space-y-6">
        {/* Navigation & Controls Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/calendar"
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>CHAMPIONSHIP CALENDAR</span>
          </Link>

          <div className="flex items-center gap-3">
            <TimezoneSelector />
          </div>
        </div>

        {/* Title, Circuit & Telemetry Meta */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-[11px] font-bold tracking-wider bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]">
                ROUND {String(round).padStart(2, '0')} • {year}
              </span>

              {isDatasetAvailable ? (
                isHistoricalArchive ? (
                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    HISTORICAL ARCHIVE • {dataSource === 'jolpica' ? 'JOLPICA' : 'STATIC'}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    CLASSIFIED
                  </span>
                )
              ) : (
                <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20">
                  UPCOMING SCHEDULE
                </span>
              )}

              {coverageReport ? (
                <Badge
                  variant="neutral"
                  className="font-mono text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  {overallCoverage}% TELEMETRY VERIFIED
                </Badge>
              ) : isHistoricalArchive ? (
                <Badge
                  variant="neutral"
                  className="font-mono text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/10 flex items-center gap-1"
                >
                  LIMITED DATA (HISTORICAL ARCHIVE)
                </Badge>
              ) : null}
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-7 rounded-sm overflow-hidden shadow-xs border border-white/10 shrink-0 mt-1">
                <CountryFlag
                  country={raceMeta?.circuit.country || 'Bahrain'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="font-display font-black text-2xl sm:text-4xl text-[var(--text)] uppercase tracking-tight">
                  {raceMeta?.raceName || `Round ${round} Grand Prix`}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)] mt-1">
                  <span className="flex items-center gap-1.5 text-[var(--text)]">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    <span>
                      {raceMeta?.circuit.name || 'Circuit'}, {raceMeta?.circuit.country || ''}
                    </span>
                  </span>

                  {raceMeta?.circuit.lengthKm && (
                    <>
                      <span>•</span>
                      <span>{raceMeta.circuit.lengthKm} km</span>
                      <span>•</span>
                      <span>{raceMeta.circuit.turns} turns</span>
                    </>
                  )}

                  {raceMeta?.schedule?.Race?.startIso && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>{formatWeekendSpan(raceMeta.schedule.Race.startIso)}</span>
                      </span>
                    </>
                  )}

                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{timezoneAbbr}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Switcher Pills */}
          <div className="flex items-center gap-1.5 bg-[var(--surface-2)]/80 border border-[var(--border)] p-1 rounded-xl overflow-x-auto self-start lg:self-auto">
            {availableSessions.map((session) => {
              const isActive = activeSession.toLowerCase() === session.toLowerCase()
              return (
                <button
                  key={session}
                  onClick={() => onSessionChange(session)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {session}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-[var(--border)]/60 pt-3">
          {RACE_TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
