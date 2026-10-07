import React from 'react'
import { Link } from 'react-router-dom'
import { LiveSessionStatus } from '@/api/types'
import { Badge } from '@/components/ui/Badge'
import { Play, RotateCcw } from 'lucide-react'

interface LiveStatusBadgeProps {
  status: LiveSessionStatus
  raceId: string
}

export const LiveStatusBadge: React.FC<LiveStatusBadgeProps> = ({ status, raceId }) => {
  if (!status.isLive && !status.isReplay) return null

  if (status.isLive) {
    return (
      <Link
        to={`/race/${raceId}`}
        className="inline-flex items-center gap-2 group transition-transform active:scale-95"
      >
        <Badge variant="live" pulse className="px-3 py-1 text-xs font-bold gap-2">
          <Play className="w-3 h-3 fill-current" />
          LIVE NOW: {status.activeSessionName || 'ON TRACK'}
        </Badge>
        <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors underline underline-offset-2">
          Open Telemetry &rarr;
        </span>
      </Link>
    )
  }

  if (status.isReplay) {
    return (
      <Link
        to={`/race/${raceId}`}
        className="inline-flex items-center gap-2 group transition-transform active:scale-95"
      >
        <Badge variant="replay" className="px-3 py-1 text-xs font-bold gap-1.5">
          <RotateCcw className="w-3 h-3" />
          SESSION REPLAY: {status.activeSessionName || 'RECENTLY FINISHED'}
        </Badge>
        <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors underline underline-offset-2">
          View Results &rarr;
        </span>
      </Link>
    )
  }

  return null
}
