import React from 'react'
import { WeekendSession } from '@/api/types'
import { useTimezone } from '@/context/TimezoneContext'
import { Badge } from '@/components/ui/Badge'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionScheduleProps {
  sessions: WeekendSession[]
  activeSessionId?: string
}

export const SessionSchedule: React.FC<SessionScheduleProps> = ({
  sessions,
  activeSessionId,
}) => {
  const { timezoneAbbr, formatTime, formatDate, formatWeekday } = useTimezone()

  // Map session type to semantic F1 badge variant
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'RACE':
        return 'session-race'
      case 'SPRINT':
        return 'session-sprint'
      case 'QUAL':
      case 'SQ':
        return 'session-qual'
      case 'FP1':
      case 'FP2':
      case 'FP3':
      default:
        return 'session-fp'
    }
  }

  return (
    <div className="space-y-2.5">
      {/* Timetable Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] pb-1.5 border-b border-[var(--border)]">
        <span className="font-bold tracking-wider uppercase text-xs">SESSION TIMETABLE</span>
        <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">{timezoneAbbr} TIMEZONE</span>
      </div>

      {/* Sessions List */}
      <div className="space-y-1.5">
        {sessions.map((session) => {
          const isTarget = session.id === activeSessionId
          const timeFormatted = formatTime(session.startTimeIso)
          const dateFormatted = formatDate(session.startTimeIso)
          const badgeVariant = getBadgeVariant(session.type)

          return (
            <div
              key={session.id}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all duration-150 border',
                // Row hover: 2px translateX plus background lift
                'hover:translate-x-0.5 hover:bg-[var(--surface-2)]',
                session.isLive
                  ? 'bg-[var(--accent-glow-subtle)] border-[var(--accent)] text-[var(--text)]'
                  : isTarget
                  ? 'timetable-next-pulse bg-[var(--surface-1)] border-[var(--accent)] text-[var(--text)]'
                  : session.isFinished
                  ? 'bg-[var(--surface-2)]/60 border-[var(--border)] text-[var(--text-muted)]'
                  : 'bg-[var(--surface-1)] border-[var(--border)] text-[var(--text)]'
              )}
            >
              {/* Session Badge (Fixed width, same height) & Title */}
              <div className="flex items-center gap-2.5">
                <Badge variant={badgeVariant} fixedSize className="f1-skew">
                  <span className="f1-unskew">{session.type}</span>
                </Badge>
                <span className="font-medium text-xs text-[var(--text)] font-sans">
                  {session.title}
                </span>
              </div>

              {/* Date, Time & Status */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono font-bold text-xs tabular-nums text-[var(--text)]">
                    {timeFormatted} <span className="text-xs text-[var(--text-muted)] font-mono font-medium">{timezoneAbbr}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono font-medium">
                    {dateFormatted}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="w-16 flex justify-end">
                  {session.isLive ? (
                    <Badge variant="live" pulse>
                      LIVE
                    </Badge>
                  ) : session.isFinished ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--timing-green)] font-mono font-bold">
                      <span className="checkered-flag-icon" />
                      DONE
                    </span>
                  ) : isTarget ? (
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] font-mono font-bold tracking-tight">
                      <Clock className="w-3.5 h-3.5" />
                      NEXT
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] font-mono font-semibold">SOON</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
