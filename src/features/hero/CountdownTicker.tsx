import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { SessionService, CountdownState } from '@/api/sessionService'
import { WeekendSession } from '@/api/types'

interface CountdownTickerProps {
  targetSession: WeekendSession | null
  raceName: string
}

interface SingleDigitProps {
  digit: string
  shouldReduceMotion?: boolean | null
}

/**
 * Individual digit roll:
 * Old digit slides up and fades, new slides in from below (180ms, ease-out).
 * Zero layout shift via fixed bounds and tabular figures.
 */
const SingleDigit: React.FC<SingleDigitProps> = ({ digit, shouldReduceMotion }) => {
  if (shouldReduceMotion) {
    return (
      <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black tabular-nums tracking-tighter text-[var(--text)] select-none">
        {digit}
      </span>
    )
  }

  return (
    <div className="relative h-10 sm:h-12 md:h-14 w-4 sm:w-5 md:w-6 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-2xl sm:text-3xl md:text-4xl font-black tabular-nums tracking-tighter text-[var(--text)] select-none"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

interface DigitSlotProps {
  value: number
  label: string
  isSeconds?: boolean
  shouldReduceMotion?: boolean | null
}

const DigitSlot: React.FC<DigitSlotProps> = ({
  value,
  label,
  isSeconds = false,
  shouldReduceMotion,
}) => {
  const padded = String(Math.max(0, value)).padStart(2, '0')
  const [d1, d2] = padded.split('')

  return (
    <div className="flex flex-col items-center">
      {/* Digit Display Card */}
      <div
        className={`relative h-14 sm:h-18 md:h-20 min-w-[56px] sm:min-w-[68px] md:min-w-[76px] px-2 sm:px-3 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg flex items-center justify-center overflow-hidden shadow-[var(--card-shadow)] ${
          isSeconds ? 'seconds-tick-pulse' : ''
        }`}
      >
        {/* Inner tight digit pair (inner gap visibly smaller than outer tile gap) */}
        <div className="flex items-center justify-center tracking-tight">
          <SingleDigit digit={d1} shouldReduceMotion={shouldReduceMotion} />
          <SingleDigit digit={d2} shouldReduceMotion={shouldReduceMotion} />
        </div>

        {/* Subtle horizontal baseline grid line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[var(--border)] opacity-30 pointer-events-none" />
      </div>

      {/* Metric Label (minimum size 12px, high contrast) */}
      <span className="mt-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold">
        {label}
      </span>
    </div>
  )
}

export const CountdownTicker: React.FC<CountdownTickerProps> = ({
  targetSession,
  raceName,
}) => {
  const shouldReduceMotion = useReducedMotion()

  const [countdown, setCountdown] = useState<CountdownState>(() => {
    if (!targetSession) {
      return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }
    return SessionService.calculateCountdown(targetSession.startTimeIso)
  })

  useEffect(() => {
    if (!targetSession) return

    const updateTimer = () => {
      setCountdown(SessionService.calculateCountdown(targetSession.startTimeIso))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [targetSession])

  if (!targetSession) {
    return (
      <div className="py-6 text-center font-mono text-xs text-[var(--text-muted)]">
        No scheduled sessions available
      </div>
    )
  }

  if (targetSession.isLive) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-[var(--accent-glow-subtle)] border border-[var(--accent)] shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent)]" />
          </span>
          <span className="font-mono font-bold text-xs uppercase tracking-wider text-[var(--accent)]">
            SESSION CURRENTLY LIVE
          </span>
        </div>
        <h3 className="font-display font-black text-xl uppercase tracking-[0.01em] text-[var(--text)]">
          {targetSession.title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{raceName}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Session Title Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[var(--text-muted)] font-medium">
          COUNTDOWN TO{' '}
          <strong className="text-[var(--text)] uppercase font-bold">
            {targetSession.title}
          </strong>
        </span>
        <span className="text-xs text-[var(--accent)] font-mono font-bold tracking-wider">
          T-MINUS
        </span>
      </div>

      {/* Countdown Slots with Vertical Digit Rolls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
        <DigitSlot
          value={countdown.days}
          label="DAYS"
          shouldReduceMotion={shouldReduceMotion}
        />
        <span className="font-mono text-xl sm:text-2xl text-[var(--text-muted)] font-bold mb-5 select-none">
          :
        </span>
        <DigitSlot
          value={countdown.hours}
          label="HOURS"
          shouldReduceMotion={shouldReduceMotion}
        />
        <span className="font-mono text-xl sm:text-2xl text-[var(--text-muted)] font-bold mb-5 select-none">
          :
        </span>
        <DigitSlot
          value={countdown.minutes}
          label="MINS"
          shouldReduceMotion={shouldReduceMotion}
        />
        <span className="font-mono text-xl sm:text-2xl text-[var(--text-muted)] font-bold mb-5 select-none">
          :
        </span>
        <DigitSlot
          value={countdown.seconds}
          label="SECS"
          isSeconds
          shouldReduceMotion={shouldReduceMotion}
        />
      </div>
    </div>
  )
}
