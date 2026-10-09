import React, { useState, useMemo } from 'react'
import { useTimezone } from '@/context/TimezoneContext'
import { IANA_TIMEZONES, TimezoneOption, formatTimeInZone } from '@/lib/timezone'
import { Dialog } from '@/components/ui/Dialog'
import { Globe, Clock, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export const TimezoneSelector: React.FC = () => {
  const { timezone, is24h, timezoneAbbr, timezoneOffset, setTimezone, toggleTimeFormat } = useTimezone()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredZones = useMemo(() => {
    if (!search.trim()) return IANA_TIMEZONES
    const q = search.toLowerCase()
    return IANA_TIMEZONES.filter(
      (z) =>
        z.label.toLowerCase().includes(q) ||
        z.city.toLowerCase().includes(q) ||
        z.value.toLowerCase().includes(q) ||
        z.region.toLowerCase().includes(q)
    )
  }, [search])

  const now = new Date()

  return (
    <>
      {/* Trigger Button in TopBar (shared h-8, border, and rounded-lg) */}
      <button
        onClick={() => setIsOpen(true)}
        className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-mono font-medium border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
        title={`Selected Timezone: ${timezone} (${timezoneOffset})`}
        aria-label="Change timezone"
      >
        <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span className="font-semibold text-[var(--text)] text-xs">{timezoneAbbr}</span>
        <span className="hidden sm:inline text-[var(--text-muted)] text-xs font-mono">{timezoneOffset}</span>
      </button>

      {/* Searchable Modal */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Telemetry Timezone & Format" maxWidth="md">
        <div className="space-y-4">
          {/* Format Toggle (24h vs 12h) */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent)]" />
              <div className="text-xs">
                <span className="font-semibold text-[var(--text)] font-sans">Time Format</span>
                <p className="text-[11px] text-[var(--text-muted)] font-mono">Motorsport standard is 24-hour (military)</p>
              </div>
            </div>
            <div className="flex rounded-md border border-[var(--border)] p-0.5 bg-[var(--surface-1)] text-xs font-mono">
              <button
                onClick={() => !is24h && toggleTimeFormat()}
                className={cn(
                  'px-2.5 py-1 rounded transition-colors cursor-pointer',
                  is24h ? 'bg-[var(--accent)] text-white font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                24H
              </button>
              <button
                onClick={() => is24h && toggleTimeFormat()}
                className={cn(
                  'px-2.5 py-1 rounded transition-colors cursor-pointer',
                  !is24h ? 'bg-[var(--accent)] text-white font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                12H
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search IANA zone, city or Grand Prix..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Zone list */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredZones.length === 0 && search.trim() && (
              <div className="py-6 text-center text-xs font-mono text-[var(--text-muted)]">
                No timezones matching "{search}"
              </div>
            )}
            {filteredZones.map((z: TimezoneOption) => {
              const isSelected = z.value === timezone
              const localTime = formatTimeInZone(now, z.value, is24h)

              return (
                <button
                  key={z.value}
                  onClick={() => {
                    setTimezone(z.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-[var(--accent-glow-subtle)] border border-[var(--accent)] text-[var(--text)]'
                      : 'hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5" />
                    )}
                    <div>
                      <div className="font-semibold text-[var(--text)]">{z.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">{z.value}</div>
                    </div>
                  </div>
                  <div className="font-mono text-[var(--text)] font-semibold">{localTime}</div>
                </button>
              )
            })}
          </div>
        </div>
      </Dialog>
    </>
  )
}
