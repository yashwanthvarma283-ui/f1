import React, { useState, useMemo } from 'react'
import {
  MessageSquare,
  Search,
  Filter,
  Zap,
  Wrench,
  AlertTriangle,
  Flame,
  Flag,
  ExternalLink,
  ChevronRight,
  Film,
  Sparkles,
} from 'lucide-react'
import { LapFeedEntry, DriverSessionInfo } from '@/types/data'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface CommentaryTabProps {
  lapFeed: LapFeedEntry[]
  drivers: DriverSessionInfo[]
  raceName?: string
  year?: number
}

type EventCategoryFilter = 'all' | 'OVERTAKE' | 'PIT_STOP' | 'SAFETY_CAR' | 'FASTEST_LAP'

export const CommentaryTab: React.FC<CommentaryTabProps> = ({
  lapFeed,
  drivers,
  raceName = 'Grand Prix',
  year = 2024,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<EventCategoryFilter>('all')
  const [selectedDriver, setSelectedDriver] = useState<string>('all')

  // Filtered laps
  const filteredFeed = useMemo(() => {
    return lapFeed.filter((entry) => {
      // Driver filter
      if (selectedDriver !== 'all') {
        const mentionsDriver =
          entry.leaderCode.toLowerCase() === selectedDriver.toLowerCase() ||
          entry.headline.toLowerCase().includes(selectedDriver.toLowerCase()) ||
          entry.summary.toLowerCase().includes(selectedDriver.toLowerCase()) ||
          entry.events.some((ev) => ev.description.toLowerCase().includes(selectedDriver.toLowerCase()))

        if (!mentionsDriver) return false
      }

      // Event category filter
      if (categoryFilter !== 'all') {
        const hasMatchingEvent = entry.events.some((ev) => {
          if (categoryFilter === 'SAFETY_CAR') {
            return (
              ev.type === 'SAFETY_CAR' ||
              ev.type === 'VSC' ||
              ev.type === 'FLAG' ||
              ev.description.toUpperCase().includes('SAFETY')
            )
          }
          return ev.type === categoryFilter
        })

        if (!hasMatchingEvent) return false
      }

      // Search query
      const q = searchQuery.toLowerCase().trim()
      if (q) {
        const matches =
          entry.headline.toLowerCase().includes(q) ||
          entry.summary.toLowerCase().includes(q) ||
          `lap ${entry.lap}`.includes(q) ||
          entry.events.some((ev) => ev.description.toLowerCase().includes(q))
        if (!matches) return false
      }

      return true
    })
  }, [lapFeed, selectedDriver, categoryFilter, searchQuery])

  // Official race highlights search URL for F1 YouTube channel
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `Formula 1 ${year} ${raceName} race highlights official`
  )}`

  return (
    <div className="space-y-8">
      {/* 1. Header & YouTube Highlights Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-xl font-display font-black uppercase tracking-tight text-[var(--text)]">
              Lap-by-Lap Commentary Feed
            </h2>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
            Auto-generated commentary from timing data &bull; Verified race telemetry events
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Zero Fabricated Causes or Speculation</span>
        </span>
      </div>

      {/* Official Broadcast Highlights & External Coverage Hub */}
      <div className="f1-card-accent p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center shrink-0">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-tight text-[var(--text)]">
                Official Formula 1 YouTube Race Highlights
              </h3>
              <p className="text-xs font-mono text-[var(--text-muted)]">
                Watch full 7-10 minute race recap and on-track battles via Formula 1&apos;s verified channel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition-colors shadow-xs"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://www.formula1.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text)] border border-[var(--border)] font-mono text-xs font-bold transition-colors"
            >
              <span>F1.com Report</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Filter Deck */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[var(--surface-1)] border border-[var(--border)] p-1 rounded-xl">
          {(
            [
              { id: 'all', label: 'All Laps', icon: <MessageSquare className="w-3 h-3" /> },
              { id: 'OVERTAKE', label: 'Overtakes', icon: <Zap className="w-3 h-3 text-sky-400" /> },
              { id: 'PIT_STOP', label: 'Pit Stops', icon: <Wrench className="w-3 h-3 text-amber-400" /> },
              {
                id: 'SAFETY_CAR',
                label: 'Safety Car & Flags',
                icon: <AlertTriangle className="w-3 h-3 text-red-400" />,
              },
              {
                id: 'FASTEST_LAP',
                label: 'Fastest Laps',
                icon: <Flame className="w-3 h-3 text-purple-400" />,
              },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setCategoryFilter(filter.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                categoryFilter === filter.id
                  ? 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Driver Filter & Search */}
        <div className="flex items-center gap-3">
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="p-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="all">All Drivers</option>
            {drivers.map((d) => (
              <option key={d.driverNumber} value={d.nameAcronym}>
                {d.nameAcronym} &bull; {d.fullName}
              </option>
            ))}
          </select>

          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search commentary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* 3. Chronological Commentary Feed */}
      <div className="space-y-4">
        {filteredFeed.map((entry) => (
          <div
            key={entry.lap}
            className="f1-card-accent p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-3 hover:border-[var(--accent)]/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2.5">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-xs font-bold text-[var(--accent)]">
                  LAP {entry.lap}
                </span>

                <h3 className="font-display font-black text-sm uppercase tracking-tight text-[var(--text)]">
                  {entry.headline}
                </h3>
              </div>

              <div className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-2">
                <span>LEADER:</span>
                <strong className="text-[var(--text)]">{entry.leaderCode}</strong>
                <span>(+{entry.gapToSecond})</span>
              </div>
            </div>

            <p className="text-xs font-sans text-[var(--text-muted)] leading-relaxed">
              {entry.summary}
            </p>

            {entry.events.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[var(--border)]/60">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
                  Event Breakdown
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {entry.events.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono flex items-start gap-2 text-[var(--text)]"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                      <span>{ev.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredFeed.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-2">
            <MessageSquare className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
            <h3 className="font-display font-bold text-sm uppercase text-[var(--text)]">
              No Commentary Laps Found
            </h3>
            <p className="text-xs font-mono text-[var(--text-muted)]">
              No laps match the selected category or driver filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
