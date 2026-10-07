import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTimezone } from '@/context/TimezoneContext'
import { Globe, Check, X } from 'lucide-react'

export const TimezoneBanner: React.FC = () => {
  const { showFirstVisitPrompt, timezone, timezoneAbbr, timezoneOffset, confirmTimezone } = useTimezone()

  return (
    <AnimatePresence>
      {showFirstVisitPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--surface-2)] border-b border-[var(--border)] text-xs px-4 py-2 relative z-40"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[var(--text-muted)] font-mono">
              <Globe className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span>
                Detected timezone: <strong className="text-[var(--text)]">{timezone}</strong> ({timezoneAbbr}, {timezoneOffset}). All session times adapt to this zone.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={confirmTimezone}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Keep {timezoneAbbr}
              </button>
              <button
                onClick={confirmTimezone}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title="Dismiss"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
