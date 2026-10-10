import React from 'react'
import { cn } from '@/lib/utils'

export const StickyNav: React.FC<{ activeSection: string }> = ({ activeSection }) => {
  const links = [
    { id: 'next-race', label: 'Next Race' },
    { id: 'results', label: 'Results' },
    { id: 'standings', label: 'Standings' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'drivers', label: 'Drivers' },
  ]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Update hash without jump
      window.history.pushState(null, '', `#${id}`)
    }
  }

  return (
    <div className="sticky top-16 z-30 w-full bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-2 py-3" aria-label="Page sections">
          {links.map((link) => {
            const isActive = activeSection === link.id
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleClick(e, link.id)}
                className={cn(
                  'dv2-press whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                )}
                aria-current={isActive ? 'true' : undefined}
              >
                {link.label}
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
