import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Flag, Calendar, Users, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export const MobileNav: React.FC = () => {
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home', icon: Flag },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/drivers', label: 'Drivers', icon: Users },
    { to: '/teams', label: 'Teams', icon: Shield },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-1)]/95 border-t border-[var(--border)] backdrop-blur-md pb-safe">
      <nav className="grid grid-cols-4 h-14" aria-label="Mobile Navigation">
        {links.map((link) => {
          const isActive = location.pathname === link.to
          const Icon = link.icon

          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors active:scale-95 select-none',
                isActive ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')} />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
