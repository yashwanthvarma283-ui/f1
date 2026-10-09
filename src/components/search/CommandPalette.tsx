import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Search, CornerDownLeft } from 'lucide-react'
import { getTeamMeta } from '@/lib/teams'
import { CountryFlag } from '@/lib/flags'
import { cn } from '@/lib/utils'

export interface DriverSearchItem {
  id: string
  name: string
  code: string
  number: string
  constructorId: string
  constructorName: string
  nationality: string
}

// Current season grid roster for instant offline search — update each season
export const F1_GRID_DRIVERS: DriverSearchItem[] = [
  { id: 'norris', name: 'Lando Norris', code: 'NOR', number: '1', constructorId: 'mclaren', constructorName: 'McLaren', nationality: 'British' },
  { id: 'piastri', name: 'Oscar Piastri', code: 'PIA', number: '81', constructorId: 'mclaren', constructorName: 'McLaren', nationality: 'Australian' },
  { id: 'max_verstappen', name: 'Max Verstappen', code: 'VER', number: '3', constructorId: 'red_bull', constructorName: 'Red Bull', nationality: 'Dutch' },
  { id: 'hadjar', name: 'Isack Hadjar', code: 'HAD', number: '6', constructorId: 'red_bull', constructorName: 'Red Bull', nationality: 'French' },
  { id: 'hamilton', name: 'Lewis Hamilton', code: 'HAM', number: '44', constructorId: 'ferrari', constructorName: 'Ferrari', nationality: 'British' },
  { id: 'leclerc', name: 'Charles Leclerc', code: 'LEC', number: '16', constructorId: 'ferrari', constructorName: 'Ferrari', nationality: 'Monegasque' },
  { id: 'russell', name: 'George Russell', code: 'RUS', number: '63', constructorId: 'mercedes', constructorName: 'Mercedes', nationality: 'British' },
  { id: 'antonelli', name: 'Andrea Kimi Antonelli', code: 'ANT', number: '12', constructorId: 'mercedes', constructorName: 'Mercedes', nationality: 'Italian' },
  { id: 'alonso', name: 'Fernando Alonso', code: 'ALO', number: '14', constructorId: 'aston_martin', constructorName: 'Aston Martin', nationality: 'Spanish' },
  { id: 'stroll', name: 'Lance Stroll', code: 'STR', number: '18', constructorId: 'aston_martin', constructorName: 'Aston Martin', nationality: 'Canadian' },
  { id: 'gasly', name: 'Pierre Gasly', code: 'GAS', number: '10', constructorId: 'alpine', constructorName: 'Alpine', nationality: 'French' },
  { id: 'colapinto', name: 'Franco Colapinto', code: 'COL', number: '43', constructorId: 'alpine', constructorName: 'Alpine', nationality: 'Argentine' },
  { id: 'albon', name: 'Alexander Albon', code: 'ALB', number: '23', constructorId: 'williams', constructorName: 'Williams', nationality: 'Thai' },
  { id: 'sainz', name: 'Carlos Sainz', code: 'SAI', number: '55', constructorId: 'williams', constructorName: 'Williams', nationality: 'Spanish' },
  { id: 'lawson', name: 'Liam Lawson', code: 'LAW', number: '30', constructorId: 'rb', constructorName: 'Racing Bulls', nationality: 'New Zealander' },
  { id: 'arvid_lindblad', name: 'Arvid Lindblad', code: 'LIN', number: '41', constructorId: 'rb', constructorName: 'Racing Bulls', nationality: 'British' },
  { id: 'ocon', name: 'Esteban Ocon', code: 'OCO', number: '31', constructorId: 'haas', constructorName: 'Haas', nationality: 'French' },
  { id: 'bearman', name: 'Oliver Bearman', code: 'BEA', number: '87', constructorId: 'haas', constructorName: 'Haas', nationality: 'British' },
  { id: 'hulkenberg', name: 'Nico Hülkenberg', code: 'HUL', number: '27', constructorId: 'audi', constructorName: 'Audi', nationality: 'German' },
  { id: 'bortoleto', name: 'Gabriel Bortoleto', code: 'BOR', number: '5', constructorId: 'audi', constructorName: 'Audi', nationality: 'Brazilian' },
  { id: 'bottas', name: 'Valtteri Bottas', code: 'BOT', number: '77', constructorId: 'cadillac', constructorName: 'Cadillac', nationality: 'Finnish' },
  { id: 'perez', name: 'Sergio Pérez', code: 'PER', number: '11', constructorId: 'cadillac', constructorName: 'Cadillac', nationality: 'Mexican' },
]

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Filtered driver suggestions
  const results = useMemo(() => {
    if (!query.trim()) {
      return F1_GRID_DRIVERS.slice(0, 6)
    }
    const q = query.toLowerCase()
    return F1_GRID_DRIVERS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.constructorName.toLowerCase().includes(q) ||
        d.number.includes(q)
    )
  }, [query])

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelectDriver(results[selectedIndex])
    }
  }

  const handleSelectDriver = (driver: DriverSearchItem) => {
    onClose()
    navigate(`/drivers?focus=${driver.id}`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative z-10 w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--surface-1)] shadow-2xl overflow-hidden text-[var(--text)]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
              <Search className="w-5 h-5 text-[var(--text-muted)] mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search driver by name, code (e.g. NOR), number or team..."
                className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none font-sans"
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)] rounded">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold">
                {query.trim() ? `Search Results (${results.length})` : 'Championship Drivers'}
              </div>

              {results.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--text-muted)] font-mono">
                  No drivers found matching &quot;{query}&quot;
                </div>
              ) : (
                results.map((driver, index) => {
                  const team = getTeamMeta(driver.constructorId)
                  const isSelected = index === selectedIndex

                  return (
                    <button
                      key={driver.id}
                      onClick={() => handleSelectDriver(driver)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer',
                        isSelected ? 'bg-[var(--surface-2)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]/60'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* 4px Team color accent bar */}
                        <div
                          className="w-1 h-7 rounded-full shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="font-mono text-xs font-bold text-[var(--text-muted)] w-6">
                          #{driver.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[var(--text)]">{driver.name}</span>
                            <span className="font-mono text-xs text-[var(--text-muted)]">({driver.code})</span>
                            <CountryFlag country={driver.nationality} className="w-3.5 h-2.5 rounded-xs" />
                          </div>
                          <div className="text-xs text-[var(--text-muted)] font-mono">{driver.constructorName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--accent)] font-bold">
                            Select <CornerDownLeft className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer shortcuts */}
            <div className="px-4 py-2 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
              <span>Navigate with &uarr; &darr;</span>
              <span>Press / or Cmd+K anytime</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
