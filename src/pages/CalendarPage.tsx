import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Trophy,
  Zap,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
} from 'lucide-react'
import { staticDataClient } from '@/api/staticDataClient'
import { useTimezone } from '@/context/TimezoneContext'
import { CountryFlag } from '@/lib/flags'
import { getTeamMeta } from '@/lib/teams'
import { TimezoneSelector } from '@/components/timezone/TimezoneSelector'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { RaceDetailMeta } from '@/types/data'

// Complete Formula 1 championship seasons from 1950 to 2026 (77 seasons)
const ALL_YEARS = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 2026 - i)

const LANDMARK_YEARS = [2026, 2025, 2024, 2021, 2016, 2008, 1998, 1988, 1976, 1950]

const ERAS = [
  { id: 'all', label: 'All Eras (1950-2026)', start: 1950, end: 2026 },
  { id: 'ground-effect', label: 'Ground Effect (2022-2026)', start: 2022, end: 2026 },
  { id: 'turbo-hybrid', label: 'Turbo-Hybrid (2014-2021)', start: 2014, end: 2021 },
  { id: 'v8', label: 'V8 Era (2006-2013)', start: 2006, end: 2013 },
  { id: 'v10', label: 'V10 Era (1995-2005)', start: 1995, end: 2005 },
  { id: 'turbo-classic', label: 'Turbo & Aero (1977-1994)', start: 1977, end: 1994 },
  { id: 'classic', label: 'Classic Era (1950-1976)', start: 1950, end: 1976 },
] as const

export const CalendarPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [selectedEra, setSelectedEra] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'upcoming' | 'sprint'>('all')
  const [expandedRound, setExpandedRound] = useState<number | null>(null)

  const { timezoneAbbr, formatTime, formatDate, formatWeekendSpan } = useTimezone()
  const shouldReduceMotion = useReducedMotion()

  // Query season metadata
  const {
    data: seasonMeta,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['season-meta', selectedYear],
    queryFn: () => staticDataClient.getSeasonMeta(selectedYear),
    staleTime: 1000 * 60 * 30, // 30 mins
  })

  // Query detail for expanded race schedule
  const { data: expandedRaceMeta } = useQuery<RaceDetailMeta | null>({
    queryKey: ['race-meta-detail', selectedYear, expandedRound],
    queryFn: () => (expandedRound ? staticDataClient.getRaceMeta(selectedYear, expandedRound) : null),
    enabled: !!expandedRound,
    staleTime: 1000 * 60 * 60,
  })

  // Determine next race index
  const nextRaceIndex = useMemo(() => {
    if (!seasonMeta?.races) return -1
    const now = Date.now()
    return seasonMeta.races.findIndex((r) => !r.isCompleted && new Date(r.date).getTime() >= now)
  }, [seasonMeta])

  // Filtered races
  const filteredRaces = useMemo(() => {
    if (!seasonMeta?.races) return []

    return seasonMeta.races.filter((race) => {
      // Search
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        race.raceName.toLowerCase().includes(q) ||
        race.circuitName.toLowerCase().includes(q) ||
        race.country.toLowerCase().includes(q) ||
        race.slug.toLowerCase().includes(q) ||
        `round ${race.round}`.includes(q) ||
        (race.winner && race.winner.name.toLowerCase().includes(q))

      if (!matchesSearch) return false

      // Status
      if (filterStatus === 'completed') return race.isCompleted
      if (filterStatus === 'upcoming') return !race.isCompleted
      if (filterStatus === 'sprint') return race.hasSprint

      return true
    })
  }, [seasonMeta, searchQuery, filterStatus])

  // Aggregate stats
  const stats = useMemo(() => {
    if (!seasonMeta?.races) return { total: 0, completed: 0, upcoming: 0, sprints: 0, avgCoverage: 0 }
    const total = seasonMeta.races.length
    const completed = seasonMeta.races.filter((r) => r.isCompleted).length
    const upcoming = total - completed
    const sprints = seasonMeta.races.filter((r) => r.hasSprint).length
    const completedWithScore = seasonMeta.races.filter((r) => r.isCompleted && r.coverageScore > 0)
    const avgCoverage =
      completedWithScore.length > 0
        ? Math.round(
            completedWithScore.reduce((acc, r) => acc + (r.coverageScore || 0), 0) /
              completedWithScore.length
          )
        : 0

    return { total, completed, upcoming, sprints, avgCoverage }
  }, [seasonMeta])

  const toggleSchedule = (round: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedRound((prev) => (prev === round ? null : round))
  }

  // Handle Era change
  const handleEraSelect = (eraId: string) => {
    setSelectedEra(eraId)
    const era = ERAS.find((e) => e.id === eraId)
    if (era && (selectedYear < era.start || selectedYear > era.end)) {
      setSelectedYear(era.end)
    }
  }

  const handlePrevYear = () => {
    if (selectedYear > 1950) setSelectedYear((prev) => prev - 1)
  }

  const handleNextYear = () => {
    if (selectedYear < 2026) setSelectedYear((prev) => prev + 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Year Switcher */}
      <div className="flex flex-col gap-6 border-b border-[var(--border)] pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-glow-subtle)] border border-[var(--accent)] font-bold">
                <Sparkles className="w-3 h-3" />
                OFFICIAL F1 ARCHIVE (1950 &ndash; 2026)
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                SEASON {selectedYear} &bull; {stats.total} ROUNDS {stats.sprints > 0 ? `• ${stats.sprints} SPRINTS` : ''}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[var(--text)] uppercase">
              Formula 1 {selectedYear} Season
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
              {selectedYear === 2024
                ? 'Complete 24-round season with high-resolution FastF1 & OpenF1 per-lap telemetry, team radio, and strategy analysis.'
                : selectedYear > 2024
                ? 'Official FIA championship calendar schedule with countdown timers and local timezone conversions.'
                : `Official ${selectedYear} championship classification, winners, and circuit history from the Jolpica/Ergast archive.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TimezoneSelector />
          </div>
        </div>

        {/* Era Switcher Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {ERAS.map((era) => (
            <button
              key={era.id}
              onClick={() => handleEraSelect(era.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                selectedEra === era.id
                  ? 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--accent)] shadow-xs'
                  : 'bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              {era.label}
            </button>
          ))}
        </div>

        {/* Year Dropdown & Landmark Year Quick Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-2.5">
          {/* Year selector with Stepper */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevYear}
              disabled={selectedYear <= 1950}
              className="rounded-xl px-2 text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              <span>{selectedYear - 1}</span>
            </Button>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-xs font-mono font-bold text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            >
              {ALL_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y} Season {y === 2024 ? '(Telemetry Verified)' : y > 2024 ? '(Upcoming)' : '(Historical)'}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextYear}
              disabled={selectedYear >= 2026}
              className="rounded-xl px-2 text-xs"
            >
              <span>{selectedYear + 1}</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          </div>

          {/* Landmark Years Quick Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase mr-1 hidden sm:inline">
              ICONIC:
            </span>
            {LANDMARK_YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedYear === y
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="f1-card-accent p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Total Grands Prix
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--text)] mt-1">
            {isLoading ? <Skeleton className="h-8 w-12" /> : stats.total}
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
            Official FIA Championship
          </div>
        </div>

        <div className="f1-card-accent p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Races Completed
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--text)] mt-1">
            {isLoading ? <Skeleton className="h-8 w-12" /> : stats.completed}
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
            Full results & timing logs
          </div>
        </div>

        <div className="f1-card-accent p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Sprint Weekends
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1 flex items-center gap-1.5">
            {isLoading ? <Skeleton className="h-8 w-12" /> : stats.sprints}
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
            Sprint shootout format
          </div>
        </div>

        <div className="f1-card-accent p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Telemetry Coverage
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : stats.avgCoverage > 0 ? (
              `${stats.avgCoverage}%`
            ) : (
              '100% Jolpica'
            )}
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
            FastF1 & OpenF1 synchronized
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-1 overflow-x-auto">
          {(
            [
              { key: 'all', label: 'All Races', count: stats.total },
              { key: 'completed', label: 'Completed', count: stats.completed },
              { key: 'upcoming', label: 'Upcoming', count: stats.upcoming },
              { key: 'sprint', label: 'Sprint Format', count: stats.sprints },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterStatus === tab.key
                  ? 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--surface-3)] text-[var(--text-muted)]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search GP, circuit, country, winner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono"
          />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-8 text-center rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 space-y-3">
          <p className="text-sm font-mono">Failed to load calendar telemetry data for {selectedYear}.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Connection
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-4 border-t border-[var(--border)] flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Race Cards Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRaces.map((race, idx) => {
            const isNext = race.round === seasonMeta?.races[nextRaceIndex]?.round
            const isExpanded = expandedRound === race.round
            const winnerTeam = race.winner?.constructorName ? getTeamMeta(race.winner.constructorName) : null
            const raceHref = `/race/${selectedYear}-${race.round}-${race.slug}`

            return (
              <motion.div
                key={`${race.round}-${race.slug}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
                className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isNext
                    ? 'border-[var(--accent)] bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)] shadow-[0_0_24px_rgba(225,6,0,0.12)]'
                    : 'border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--accent)]/50 hover:shadow-md'
                }`}
              >
                {/* Accent top stripe */}
                {isNext && (
                  <div className="h-1 w-full bg-[var(--accent)]" />
                )}

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Top Bar: Round Badge, Status & Sprint Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold tracking-wider bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]">
                          R{String(race.round).padStart(2, '0')}
                        </span>

                        {isNext && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-glow-subtle)] border border-[var(--accent)]/40 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                            NEXT RACE
                          </span>
                        )}

                        {race.isCompleted && (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            COMPLETED
                          </span>
                        )}

                        {!race.isCompleted && !isNext && (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)]">
                            UPCOMING
                          </span>
                        )}
                      </div>

                      {race.hasSprint && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20">
                          <Zap className="w-3 h-3" />
                          SPRINT
                        </span>
                      )}
                    </div>

                    {/* Country & Grand Prix Title */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-6 rounded overflow-hidden shadow-xs border border-white/10 shrink-0 mt-1">
                        <CountryFlag country={race.country} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link to={`${raceHref}?session=Race`} className="block group/title">
                          <h3 className="font-display font-black text-lg text-[var(--text)] uppercase tracking-tight leading-snug group-hover/title:text-[var(--accent)] transition-colors truncate">
                            {race.raceName}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5 truncate">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" />
                          <span className="truncate">{race.circuitName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekend Date & Timezone */}
                  <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-[var(--text)]">
                      <CalendarIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>{formatWeekendSpan(race.date)}</span>
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{timezoneAbbr}</span>
                    </div>
                  </div>

                  {/* Winner / Coverage Badge */}
                  <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between text-xs">
                    {race.isCompleted && race.winner ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">WINNER:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: winnerTeam?.color || '#E10600' }}
                          />
                          <span className="font-mono font-bold text-[var(--text)] text-xs">
                            {race.winner.code || race.winner.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-[var(--text-muted)]">
                        Classification pending
                      </div>
                    )}

                    {race.coverageScore > 0 && (
                      <Badge
                        variant="neutral"
                        className="font-mono text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                      >
                        {race.coverageScore}% Telemetry
                      </Badge>
                    )}
                  </div>

                  {/* Expandable Session Timetable Drawer */}
                  <div className="pt-2">
                    <button
                      onClick={(e) => toggleSchedule(race.round, e)}
                      className="w-full py-1.5 px-2 rounded-lg bg-[var(--surface-2)]/60 hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] text-[11px] font-mono flex items-center justify-between transition-colors border border-[var(--border)]/40"
                    >
                      <span>Session Schedule ({timezoneAbbr})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-2 pt-2 border-t border-[var(--border)]/60 space-y-1.5"
                        >
                          {expandedRaceMeta?.schedule ? (
                            Object.entries(expandedRaceMeta.schedule).map(([sessionName, sessionData]) => {
                              const isRaceSession = sessionName.toLowerCase() === 'race'
                              return (
                                <Link
                                  key={sessionName}
                                  to={`${raceHref}?session=${encodeURIComponent(sessionName)}`}
                                  className={`flex items-center justify-between text-[11px] font-mono py-1.5 px-2 rounded-lg transition-all group/sess ${
                                    isRaceSession
                                      ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-bold shadow-xs'
                                      : 'bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-[var(--text)]'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    {isRaceSession && <Play className="w-3 h-3 fill-current shrink-0 animate-pulse" />}
                                    <span className="font-semibold">{sessionName}</span>
                                    {isRaceSession && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--accent)]/20 text-[var(--accent)] group-hover/sess:bg-white/20 group-hover/sess:text-white uppercase font-mono">
                                        Replay &amp; Data
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[var(--text-muted)] group-hover/sess:text-[var(--text)] transition-colors flex items-center gap-1">
                                    <span>
                                      {formatDate(sessionData.startIso)} • {formatTime(sessionData.startIso)}
                                    </span>
                                    <ChevronRight className="w-3 h-3 transition-transform group-hover/sess:translate-x-0.5" />
                                  </span>
                                </Link>
                              )
                            })
                          ) : (
                            <div className="space-y-1">
                              {['FP1', 'FP2', 'FP3', 'Qualifying', 'Race'].map((sess) => {
                                const isRace = sess === 'Race'
                                return (
                                  <Link
                                    key={sess}
                                    to={`${raceHref}?session=${sess}`}
                                    className={`flex items-center justify-between text-[11px] font-mono py-1.5 px-2 rounded-lg transition-all ${
                                      isRace
                                        ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-bold'
                                        : 'bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-[var(--text)]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {isRace && <Play className="w-3 h-3 fill-current" />}
                                      <span>{sess}</span>
                                      {isRace && (
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--accent)]/20 uppercase">
                                          Replay &amp; Telemetry
                                        </span>
                                      )}
                                    </div>
                                    <ChevronRight className="w-3 h-3" />
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <Link
                  to={`${raceHref}?session=Race`}
                  className="px-5 py-3 border-t border-[var(--border)] bg-[var(--surface-2)]/40 hover:bg-[var(--accent)] hover:text-white text-xs font-mono font-bold flex items-center justify-between transition-colors group-hover:bg-[var(--accent)] group-hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>VIEW RACE TELEMETRY &amp; REPLAY</span>
                  </div>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty Search Filter State */}
      {!isLoading && !isError && filteredRaces.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-3">
          <Filter className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
          <h3 className="font-display font-bold text-lg text-[var(--text)] uppercase">No Grands Prix Found</h3>
          <p className="text-xs font-mono text-[var(--text-muted)] max-w-sm mx-auto">
            No races match your active search &ldquo;{searchQuery}&rdquo; and filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setFilterStatus('all')
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
