import React, { useEffect, useState } from 'react'
import { SessionService } from '@/api/sessionService'
import type { CountdownState } from '@/api/sessionService'
import { cn } from '@/lib/utils'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * One countdown unit. The digits remount when the value changes, which
 * replays the 120ms opacity tick in dashboard-v2.css.
 */
const Unit: React.FC<{ value: number; unit: string; large?: boolean }> = ({
  value,
  unit,
  large = false,
}) => (
  <span className="inline-flex items-baseline">
    <span
      key={value}
      className={cn(
        'dv2-tick dv2-fig font-semibold text-[var(--dv2-hero-text)]',
        large ? 'text-[36px] md:text-[48px] leading-none' : 'text-[28px] md:text-[34px] leading-none'
      )}
    >
      {pad(value)}
    </span>
    <span
      className="ml-0.5 mr-2 text-[12px] md:text-[13px] font-medium uppercase text-[var(--dv2-hero-muted)]"
      aria-hidden="true"
    >
      {unit}
    </span>
  </span>
)

/**
 * Counts down to a target ISO timestamp, ticking once a second.
 * Renders nothing but an em dash when the target is unusable.
 */
export const Countdown: React.FC<{
  targetIso: string | null
  label: string
}> = ({ targetIso, label }) => {
  const [state, setState] = useState<CountdownState | null>(() =>
    targetIso ? SessionService.calculateCountdown(targetIso) : null
  )

  useEffect(() => {
    if (!targetIso) {
      setState(null)
      return
    }

    setState(SessionService.calculateCountdown(targetIso))
    const id = window.setInterval(() => {
      setState(SessionService.calculateCountdown(targetIso))
    }, 1000)

    return () => window.clearInterval(id)
  }, [targetIso])

  const spokenLabel = state && !state.isExpired
    ? `${label} in ${state.days} days, ${state.hours} hours, ${state.minutes} minutes`
    : label

  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.1em] font-medium text-[var(--dv2-hero-muted)]">
        {label}
      </div>

      <div className="mt-2" aria-label={spokenLabel}>
        {!state || state.isExpired ? (
          <span className="dv2-fig text-[36px] md:text-[48px] font-semibold leading-none text-[var(--dv2-hero-text)]">
            —
          </span>
        ) : (
          <span className="flex flex-wrap items-baseline" aria-hidden="true">
            {state.days > 0 ? <Unit value={state.days} unit="d" large /> : null}
            <Unit value={state.hours} unit="h" large={state.days === 0} />
            <Unit value={state.minutes} unit="m" large={state.days === 0} />
            <Unit value={state.seconds} unit="s" large={state.days === 0} />
          </span>
        )}
      </div>
    </div>
  )
}
