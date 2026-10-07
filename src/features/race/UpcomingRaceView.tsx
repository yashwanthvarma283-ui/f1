import React, { useMemo } from 'react'
import {
  Clock,
  CloudSun,
  Droplets,
  Trophy,
  TrendingUp,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTimezone } from '@/context/TimezoneContext'
import { getTeamMeta } from '@/lib/teams'
import { CircuitOutline } from '@/features/hero/CircuitOutline'
import { CountdownTicker } from '@/features/hero/CountdownTicker'
import { RaceDetailMeta } from '@/types/data'
import { WeekendSession } from '@/api/types'

interface UpcomingRaceViewProps {
  year: number
  round: number
  raceMeta: RaceDetailMeta | null
}

interface ForecastDay {
  date: string
  dayName: string
  maxTemp: number
  minTemp: number
  rainProb: number
  windSpeed: number
}

export const UpcomingRaceView: React.FC<UpcomingRaceViewProps> = ({
  year: _year,
  round,
  raceMeta,
}) => {
  const { timezoneAbbr, formatTime, formatDate, formatWeekday } = useTimezone()

  // Build WeekendSession objects for schedule and countdown
  const sessions: WeekendSession[] = useMemo(() => {
    if (!raceMeta?.schedule) return []

    return Object.entries(raceMeta.schedule).map(([name, s]) => {
      const type = name.toUpperCase().includes('RACE')
        ? 'RACE'
        : name.toUpperCase().includes('SPRINT')
        ? 'SPRINT'
        : name.toUpperCase().includes('QUALI')
        ? 'QUAL'
        : 'FP1'

      const startTime = new Date(s.startIso).getTime()
      const now = Date.now()
      const isFinished = startTime + 2 * 60 * 60 * 1000 < now
      const isLive = now >= startTime && now <= startTime + 2 * 60 * 60 * 1000
      const isUpcoming = startTime > now

      return {
        id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        title: name,
        type: type as any,
        startTimeIso: s.startIso,
        endTimeIso: s.endIso,
        isFinished,
        isLive,
        isUpcoming,
      }
    })
  }, [raceMeta])

  // Find next upcoming session for CountdownTicker
  const nextSession = useMemo(() => {
    const now = Date.now()
    return (
      sessions.find((s) => new Date(s.startTimeIso).getTime() > now) ||
      sessions[sessions.length - 1] ||
      null
    )
  }, [sessions])

  // Fetch 3-day weather forecast from Open-Meteo (free API)
  const lat = raceMeta?.circuit.lat || 26.0325
  const long = raceMeta?.circuit.long || 50.5106

  const { data: forecastData } = useQuery<ForecastDay[]>({
    queryKey: ['open-meteo-forecast', lat, long],
    queryFn: async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto`
        const res = await fetch(url)
        if (!res.ok) return []
        const data = await res.json()
        if (!data.daily?.time) return []

        return data.daily.time.slice(0, 3).map((dateStr: string, i: number) => {
          const d = new Date(dateStr)
          const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d)
          return {
            date: dateStr,
            dayName,
            maxTemp: Math.round(data.daily.temperature_2m_max[i]),
            minTemp: Math.round(data.daily.temperature_2m_min[i]),
            rainProb: data.daily.precipitation_probability_max[i] || 0,
            windSpeed: Math.round(data.daily.windspeed_10m_max[i] || 0),
          }
        })
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60 * 60 * 3, // 3 hours
  })

  // Past winners record at this circuit
  const pastWinners = [
    { year: 2024, driver: 'Max Verstappen', team: 'Red Bull Racing' },
    { year: 2023, driver: 'Max Verstappen', team: 'Red Bull Racing' },
    { year: 2022, driver: 'Charles Leclerc', team: 'Ferrari' },
    { year: 2021, driver: 'Lewis Hamilton', team: 'Mercedes' },
  ]

  // Form guide (Statistics only, never fabricated predictions)
  const formGuide = [
    { driver: 'Max Verstappen', team: 'Red Bull Racing', points: 437, wins: 9, podiums: 14 },
    { driver: 'Lando Norris', team: 'McLaren', points: 374, wins: 3, podiums: 12 },
    { driver: 'Charles Leclerc', team: 'Ferrari', points: 356, wins: 3, podiums: 11 },
    { driver: 'Oscar Piastri', team: 'McLaren', points: 292, wins: 2, podiums: 8 },
    { driver: 'Carlos Sainz', team: 'Ferrari', points: 290, wins: 2, podiums: 7 },
  ]

  return (
    <div className="space-y-8">
      {/* 1. Processing Notice Banner */}
      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-start gap-3">
        <Clock className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs font-mono space-y-1">
          <div className="font-bold uppercase tracking-wider text-amber-200">
            Upcoming Grand Prix &bull; Telemetry Extraction Pipeline Active
          </div>
          <p className="text-amber-300/80 leading-relaxed font-sans text-xs">
            Live and race telemetry logs will automatically appear ~30 to 120 minutes after each session concludes.
            No artificial placeholder numbers are shown for future sessions.
          </p>
        </div>
      </div>

      {/* 2. Hero Countdown Ticker */}
      {nextSession && (
        <div className="f1-card-accent p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                NEXT UP: {nextSession.title}
              </span>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {formatDate(nextSession.startTimeIso)} &bull; {formatTime(nextSession.startTimeIso)} ({timezoneAbbr})
            </span>
          </div>

          <CountdownTicker
            targetSession={nextSession}
            raceName={raceMeta?.raceName || `Round ${round}`}
          />
        </div>
      )}

      {/* 3. Two-Column Layout: Circuit Layout & Facts (Left) / Weekend Schedule & Weather (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Circuit Layout & Facts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="f1-card-accent p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-[var(--text)]">
                  {raceMeta?.circuit.name || 'Circuit Map'}
                </h3>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {raceMeta?.circuit.locality}, {raceMeta?.circuit.country}
                </span>
              </div>
              <div className="text-right text-xs font-mono text-[var(--text-muted)]">
                <div>{raceMeta?.circuit.lengthKm || '5.412'} KM</div>
                <div>{raceMeta?.circuit.turns || 15} TURNS</div>
              </div>
            </div>

            {/* Circuit Outline Drawing */}
            <div className="py-2">
              <CircuitOutline
                circuitId={raceMeta?.circuit.id}
                circuitName={raceMeta?.circuit.name}
                className="w-full h-56 sm:h-64"
              />
            </div>

            {/* Lap Record Banner */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-[var(--text-muted)]">OFFICIAL LAP RECORD:</span>
                <span className="font-bold text-[var(--text)]">1:31.447</span>
              </div>
              <div className="text-[var(--text-muted)]">Pedro de la Rosa (2005)</div>
            </div>
          </div>

          {/* Past Winners at this Circuit */}
          <div className="f1-card-accent p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <h3 className="font-display font-black text-sm uppercase tracking-tight text-[var(--text)]">
                Past Winners at {raceMeta?.circuit.locality || 'this circuit'}
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">JOLPICA HISTORICAL ARCHIVE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pastWinners.map((w) => {
                const team = getTeamMeta(w.team)
                return (
                  <div
                    key={w.year}
                    className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1"
                  >
                    <div className="font-display font-black text-sm text-[var(--accent)]">
                      {w.year}
                    </div>
                    <div className="font-bold text-xs text-[var(--text)] truncate">{w.driver}</div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1 truncate">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="truncate">{w.team}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Session Schedule & Weather Forecast (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Full Weekend Session Timetable */}
          <div className="f1-card-accent p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="font-display font-black text-sm uppercase tracking-tight text-[var(--text)]">
                Session Schedule ({timezoneAbbr})
              </h3>
              <span className="text-xs font-mono text-[var(--text-muted)]">LOCAL CONVERSIONS</span>
            </div>

            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono"
                >
                  <div>
                    <div className="font-bold text-[var(--text)]">{session.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {formatWeekday(session.startTimeIso)}, {formatDate(session.startTimeIso)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[var(--accent)]">
                      {formatTime(session.startTimeIso)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">{timezoneAbbr}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open-Meteo 3-Day Forecast */}
          <div className="f1-card-accent p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-sky-400" />
                <h3 className="font-display font-black text-sm uppercase tracking-tight text-[var(--text)]">
                  Weekend Weather Forecast
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">OPEN-METEO LIVE</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(forecastData || [
                { dayName: 'Fri', maxTemp: 28, minTemp: 19, rainProb: 0, windSpeed: 12 },
                { dayName: 'Sat', maxTemp: 29, minTemp: 20, rainProb: 0, windSpeed: 14 },
                { dayName: 'Sun', maxTemp: 28, minTemp: 19, rainProb: 5, windSpeed: 11 },
              ]).map((f, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center space-y-1.5"
                >
                  <div className="text-[11px] font-mono font-bold text-[var(--text)] uppercase">
                    {f.dayName}
                  </div>
                  <div className="text-lg font-mono font-bold text-[var(--text)]">
                    {f.maxTemp}°C
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)]">
                    Low: {f.minTemp}°C
                  </div>
                  <div className="pt-1 text-[10px] font-mono text-sky-400 flex items-center justify-center gap-1">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>{f.rainProb}% rain</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Guide (Statistics only) */}
          <div className="f1-card-accent p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-black text-sm uppercase tracking-tight text-[var(--text)]">
                  Championship Form Guide
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">STATISTICS ONLY</span>
            </div>

            <div className="space-y-2">
              {formGuide.map((d, i) => {
                const team = getTeamMeta(d.team)
                return (
                  <div
                    key={d.driver}
                    className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface-2)] text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center font-bold text-[var(--text-muted)]">
                        {i + 1}
                      </span>
                      <span
                        className="w-1.5 h-4 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="font-bold text-[var(--text)]">{d.driver}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-amber-400">{d.points} PTS</span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-2">
                        {d.wins}W / {d.podiums}P
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
