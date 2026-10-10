import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from './primitives'

export interface NavItem {
  to: string
  label: string
}

/**
 * Mobile slide-in drawer. Enters at 260ms, exits at 180ms via the
 * data-state attribute in dashboard-v2.css.
 */
export const MobileDrawer: React.FC<{
  isOpen: boolean
  onClose: () => void
  items: NavItem[]
  activeLabel: string
  footer?: React.ReactNode
}> = ({ isOpen, onClose, items, activeLabel, footer }) => {
  // Escape to dismiss, and lock the page behind the drawer
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 lg:hidden',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="Close menu"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/60 transition-opacity duration-200 cursor-default',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        data-state={isOpen ? 'open' : 'closed'}
        className={cn(
          'dv2-drawer absolute right-0 top-0 h-full w-[300px] max-w-[85vw]',
          'bg-[var(--surface-1)] border-l border-[var(--border)]',
          'flex flex-col'
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border-subtle)]">
          <Label>Menu</Label>
          <button
            type="button"
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
            aria-label="Close menu"
            className="dv2-press h-9 w-9 inline-flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex flex-col py-2">
          {items.map((item) => {
            const isActive = item.label === activeLabel
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative px-5 py-4 text-[17px] font-semibold',
                  'font-[family-name:var(--font-display)] uppercase tracking-[0.01em]',
                  'transition-colors duration-150',
                  isActive
                    ? 'text-[var(--text)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] bg-[var(--accent)]"
                  />
                ) : null}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {footer ? (
          <div className="mt-auto px-5 py-5 border-t border-[var(--border-subtle)] flex items-center gap-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
