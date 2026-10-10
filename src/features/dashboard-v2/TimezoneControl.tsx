import React, { useMemo, useState } from 'react'
import { useTimezone } from '@/context/TimezoneContext'
import { IANA_TIMEZONES, formatTimeInZone } from '@/lib/timezone'
import { Dialog } from '@/components/ui/Dialog'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from './primitives'

/**
 * Compact timezone control for the dashboard-v2 header.
 * Reuses the existing TimezoneContext and the shared Dialog, but carries
 * this page's radius and colour rules instead of the global TopBar styling.
 */
export const TimezoneControl: React.FC<{ className?: string }> = ({ className }) => {
  const { timezone, is24h, timezoneAbbr, timezoneOffset, setTimezone, toggleTimeFormat } =
    useTimezone()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const zones = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return IANA_TIMEZONES
    return IANA_TIMEZONES.filter(
      (z) =>
        z.label.toLowerCase().includes(query) ||
        z.city.toLowerCase().includes(query) ||
        z.value.toLowerCase().includes(query) ||
        z.region.toLowerCase().includes(query)
    )
  }, [search])

  const now = new Date()

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Change timezone. Currently ${timezone}, ${timezoneOffset}`}
        className={cn(
          'dv2-press h-9 inline-flex items-center gap-2 px-3 rounded-full',
          'border border-[var(--border)] bg-transparent',
          'text-[13px] text-[var(--text-muted)]',
          'hover:text-[var(--text)] hover:border-[var(--text-muted)]',
          'transition-colors duration-150 cursor-pointer',
          className
        )}
      >
        <span className="dv2-fig font-medium text-[var(--text)] whitespace-nowrap">
          {timezoneAbbr.startsWith('GMT') || timezoneAbbr.startsWith('UTC') || timezoneAbbr === timezoneOffset
            ? timezoneOffset 
            : `${timezoneAbbr} ${timezoneOffset}`}
        </span>
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Timezone"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4">
          {/* Clock format */}
          <div className="flex items-center justify-between gap-4">
            <Label>Clock</Label>
            <div
              className="inline-flex items-center rounded-full border border-[var(--border)] p-[2px]"
              role="group"
              aria-label="Clock format"
            >
              {[
                { label: '24h', active: is24h },
                { label: '12h', active: !is24h },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={option.active}
                  onClick={() => {
                    if (!option.active) toggleTimeFormat()
                  }}
                  className={cn(
                    'dv2-fig h-7 px-3 rounded-full text-[12px] font-medium',
                    'transition-colors duration-150 cursor-pointer',
                    option.active
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="dv2-tz-search"
              className="block text-[11px] uppercase tracking-[0.1em] font-medium text-[var(--text-muted)] mb-2"
            >
              Search
            </label>
            <input
              id="dv2-tz-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full h-10 px-3 rounded-[4px]',
                'bg-[var(--surface-2)] border border-[var(--border)]',
                'text-[15px] text-[var(--text)]',
                'focus-visible:outline-none focus-visible:border-[var(--accent)]'
              )}
            />
          </div>

          <ul className="dv2-scroll max-h-[320px] overflow-y-auto -mx-1 px-1">
            {zones.length === 0 ? (
              <li className="text-[13px] text-[var(--text-muted)] py-4">
                No timezone matches that search.
              </li>
            ) : (
              zones.map((zone) => {
                const isSelected = zone.value === timezone
                return (
                  <li key={zone.value}>
                    <button
                      type="button"
                      onClick={() => {
                        setTimezone(zone.value)
                        setIsOpen(false)
                      }}
                      className={cn(
                        'dv2-row w-full flex items-center gap-3 px-3 h-12 rounded-[4px] text-left',
                        'transition-colors duration-150 cursor-pointer'
                      )}
                    >
                      <span className="w-4 shrink-0">
                        {isSelected ? (
                          <Check className="w-4 h-4 text-[var(--accent-text)]" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] text-[var(--text)] truncate">
                          {zone.city}
                        </span>
                        <span className="block text-[12px] text-[var(--text-muted)] truncate">
                          {zone.region}
                        </span>
                      </span>
                      <span className="dv2-fig text-[13px] text-[var(--text-muted)] shrink-0">
                        {formatTimeInZone(now, zone.value, is24h)}
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </Dialog>
    </>
  )
}
