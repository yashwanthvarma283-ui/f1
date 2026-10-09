import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react'
import { useSchedule, useDriverStandings, useConstructorStandings } from '@/api/useF1Data'
import { SessionService } from '@/api/sessionService'
import { getTeamMeta } from '@/lib/teams'
import { CountryFlag } from '@/lib/flags'
import { Trophy, Clock, Flag, MapPin, Zap, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * PREMIUM F1 TELEMETRY DASHBOARD
 *
 * Design Philosophy: Racing Heritage Meets Precision Engineering
 * - Asymmetric power alley layout (not centered grids)
 * - Kinetic typography with extreme condensed weights
 * - Functional color (red=live, purple=fastest, green=improving)
 * - Mixed geometries (sharp timing tower, selective rounding)
 * - One signature motion sequence on load, then still
 * - Data density where needed, air where it breathes
 */

export const TestDashboard: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  // Data hooks
  const scheduleQuery = useSchedule('current')
  const driversQuery = useDriverStandings('current')
  const constructorsQuery = useConstructorStandings('current')

  const nextRace = React.useMemo(() => {
    return SessionService.findNextRace(scheduleQuery.data?.races || [])
  }, [scheduleQuery.data])

  const topDrivers = driversQuery.data?.slice(0, 5) || []
  const topConstructors = constructorsQuery.data?.slice(0, 3) || []

  // Countdown state
  const [timeToRace, setTimeToRace] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!nextRace?.date || !nextRace?.time) return

    const interval = setInterval(() => {
      const now = new Date()
      const raceDateTime = new Date(`${nextRace.date}T${nextRace.time}`)
      const diff = raceDateTime.getTime() - now.getTime()

      if (diff > 0) {
        setTimeToRace({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [nextRace])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0D14] text-[#F8F9FA]">
      {/* HERO: Left-aligned power alley with diagonal emphasis */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b-2 border-[#E10600]">
        {/* Background: Subtle grid + carbon fiber texture */}
        <div className="absolute inset-0">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#F8F9FA 1px, transparent 1px), linear-gradient(90deg, #F8F9FA 1px, transparent 1px)`,
              backgroundSize: '64px 64px'
            }}
          />
          {/* Speed lines - diagonal right */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="speedlines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <line x1="0" y1="20" x2="100" y2="10" stroke="#F8F9FA" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="40" stroke="#F8F9FA" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="100" y2="70" stroke="#F8F9FA" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#speedlines)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-12 w-full">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* LEFT POWER ALLEY: Hero content */}
            <motion.div
              className="col-span-12 lg:col-span-7"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Race status badge */}
              <motion.div
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-[#E10600]/10 border border-[#E10600]/30"
                initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
                <span className="text-xs font-mono text-[#E10600] font-semibold tracking-wide">
                  NEXT RACE
                </span>
              </motion.div>

              {/* Race name - HUGE condensed type */}
              <motion.h1
                className="font-display font-black text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-[-0.04em] mb-4"
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {nextRace ? (
                  <>
                    {nextRace.raceName.replace(' Grand Prix', '').toUpperCase()}
                    <br />
                    <span className="text-[#FFD60A]">GRAND PRIX</span>
                  </>
                ) : (
                  'LOADING TELEMETRY...'
                )}
              </motion.h1>

              {/* Location info */}
              {nextRace && (
                <motion.div
                  className="flex items-center gap-4 mb-8 text-[#B4B4C4]"
                  initial={shouldReduceMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{nextRace.Circuit.Location.locality}</span>
                  </div>
                  <div className="w-px h-4 bg-[#2A2D3A]" />
                  <CountryFlag country={nextRace.Circuit.Location.country} className="w-6 h-4" />
                  <span className="text-sm">{nextRace.Circuit.Location.country}</span>
                </motion.div>
              )}

              {/* Countdown - massive numbers */}
              <motion.div
                className="flex gap-4 mb-8"
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {[
                  { value: timeToRace.days, label: 'DAYS' },
                  { value: timeToRace.hours, label: 'HRS' },
                  { value: timeToRace.minutes, label: 'MIN' },
                  { value: timeToRace.seconds, label: 'SEC' }
                ].map((unit, i) => (
                  <div key={unit.label} className="flex flex-col">
                    <div className="font-display font-black text-5xl sm:text-6xl tabular-nums tracking-tighter text-[#F8F9FA] leading-none">
                      {String(unit.value).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-mono text-[#B4B4C4] mt-1 tracking-wider">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* CTA - sharp geometry */}
              <motion.button
                className="group relative px-8 py-4 bg-[#E10600] text-white font-bold text-sm tracking-wide overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  VIEW FULL SCHEDULE
                  <Zap className="w-4 h-4" />
                </span>
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </motion.div>

            {/* RIGHT COLUMN: Live timing tower - sharp, data-dense */}
            <motion.div
              className="col-span-12 lg:col-span-5"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            >
              <LiveTimingTower drivers={topDrivers} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* STANDINGS: Asymmetric two-column */}
      <section className="py-20 px-6 sm:px-12 border-b border-[#2A2D3A]">
        <div className="max-w-[1600px] mx-auto">
          {/* Section label - functional not decorative */}
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-5 h-5 text-[#FFD60A]" />
            <h2 className="font-display font-black text-3xl tracking-tight">
              CHAMPIONSHIP STANDINGS
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Drivers - 70% width */}
            <div className="lg:col-span-7">
              <DriversStandings drivers={topDrivers} />
            </div>

            {/* Constructors - 30% width */}
            <div className="lg:col-span-5">
              <ConstructorsStandings constructors={topConstructors} />
            </div>
          </div>
        </div>
      </section>

      {/* TRACK INFO: Full bleed with next race circuit data */}
      {nextRace && (
        <section className="py-16 px-6 sm:px-12 bg-[#15151E]">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CircuitStat
                label="Circuit Length"
                value={nextRace.Circuit.circuitName.includes('Monaco') ? '3.337 km' : 'Loading...'}
                icon={<Flag className="w-5 h-5" />}
              />
              <CircuitStat
                label="Race Distance"
                value="305 km"
                icon={<Zap className="w-5 h-5" />}
              />
              <CircuitStat
                label="Lap Record"
                value="1:14.260"
                icon={<Timer className="w-5 h-5" />}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * Live Timing Tower - Sharp geometry, data-dense, timing screen aesthetic
 */
const LiveTimingTower: React.FC<{ drivers: any[] }> = ({ drivers }) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="bg-[#15151E] border-l-4 border-[#E10600]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#E10600] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-white">
            LIVE TIMING
          </span>
        </div>
        <Clock className="w-4 h-4 text-white" />
      </div>

      {/* Driver rows */}
      <div className="divide-y divide-[#2A2D3A]">
        {drivers.map((driver, i) => {
          const team = getTeamMeta(driver.constructor.constructorId)
          const isPole = i === 0

          return (
            <motion.div
              key={driver.driver.driverId}
              className="px-4 py-3 hover:bg-[#1A1D28] transition-colors"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3">
                {/* Position */}
                <div
                  className="w-8 h-8 flex items-center justify-center font-display font-black text-sm"
                  style={{
                    backgroundColor: team.color,
                    color: team.contrastTextColor
                  }}
                >
                  {driver.position}
                </div>

                {/* Driver code */}
                <div className="flex-1">
                  <div className="font-mono font-bold text-sm tracking-tight">
                    {driver.driver.code || driver.driver.familyName.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="text-xs text-[#B4B4C4] flex items-center gap-2">
                    <CountryFlag country={driver.driver.nationality} className="w-4 h-3" />
                    {driver.driver.familyName}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="font-mono font-bold text-lg tabular-nums">
                    {driver.points}
                  </div>
                  <div className="text-[10px] text-[#B4B4C4] font-mono">PTS</div>
                </div>

                {/* Status indicator */}
                {isPole && (
                  <div className="w-3 h-3 rounded-full bg-[#B138DD]" title="Pole position" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Drivers Standings - Full list with team colors
 */
const DriversStandings: React.FC<{ drivers: any[] }> = ({ drivers }) => {
  return (
    <div className="space-y-3">
      {drivers.map((driver, i) => {
        const team = getTeamMeta(driver.constructor.constructorId)
        const leaderPoints = drivers[0]?.points || 1
        const pointsWidth = (driver.points / leaderPoints) * 100

        return (
          <motion.div
            key={driver.driver.driverId}
            className="relative bg-[#15151E] overflow-hidden group hover:bg-[#1A1D28] transition-colors"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            {/* Team color bar (left edge) */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: team.color }}
            />

            {/* Points progress bar (background) */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 opacity-10"
              style={{ backgroundColor: team.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${pointsWidth}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
            />

            {/* Content */}
            <div className="relative px-4 py-4 flex items-center gap-4">
              {/* Position */}
              <div className="w-10 text-center font-display font-black text-2xl text-[#B4B4C4]">
                {driver.position}
              </div>

              {/* Driver info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#F8F9FA] flex items-center gap-2">
                  <CountryFlag country={driver.driver.nationality} className="w-5 h-3.5" />
                  <span className="truncate">
                    {driver.driver.givenName} <span className="font-display font-black uppercase tracking-tight">{driver.driver.familyName}</span>
                  </span>
                </div>
                <div className="text-sm text-[#B4B4C4] mt-0.5">{driver.constructor.name}</div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="font-display font-black text-3xl tabular-nums" style={{ color: team.color }}>
                  {driver.points}
                </div>
                <div className="text-xs text-[#B4B4C4] font-mono">POINTS</div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/**
 * Constructors Standings - Compact version
 */
const ConstructorsStandings: React.FC<{ constructors: any[] }> = ({ constructors }) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-[#B4B4C4] font-mono tracking-wide">CONSTRUCTORS</div>
      {constructors.map((constructor, i) => {
        const team = getTeamMeta(constructor.constructor.constructorId)

        return (
          <motion.div
            key={constructor.constructor.constructorId}
            className="bg-[#15151E] p-4 border-l-2 hover:bg-[#1A1D28] transition-colors"
            style={{ borderColor: team.color }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-display font-black text-xl text-[#B4B4C4]">
                  {constructor.position}
                </div>
                <div>
                  <div className="font-bold text-[#F8F9FA]">{constructor.constructor.name}</div>
                  <div className="text-xs text-[#B4B4C4] mt-0.5">{constructor.points} points</div>
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                style={{
                  backgroundColor: `${team.color}20`,
                  borderColor: team.color
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/**
 * Circuit Stat - Minimal info tile
 */
const CircuitStat: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({
  label,
  value,
  icon
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="text-[#FFD60A]">{icon}</div>
      <div>
        <div className="text-sm text-[#B4B4C4]">{label}</div>
        <div className="font-display font-black text-2xl tracking-tight mt-1">{value}</div>
      </div>
    </div>
  )
}
