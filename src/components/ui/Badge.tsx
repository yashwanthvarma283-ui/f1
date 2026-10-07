import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'live'
    | 'replay'
    | 'outline'
    | 'neutral'
    | 'accent'
    | 'session-fp'
    | 'session-qual'
    | 'session-sprint'
    | 'session-race'
    | 'tyre-soft'
    | 'tyre-medium'
    | 'tyre-hard'
    | 'tyre-inter'
    | 'tyre-wet'
  pulse?: boolean
  teamColor?: string
  fixedSize?: boolean
}

/**
 * F1 Semantic Status & Session Badge:
 * - Fixed width, same height for session badges
 * - Calibrated WCAG AA contrast for both light & dark modes
 * - Zero raw hex: strictly uses CSS custom properties
 */
export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  pulse = false,
  teamColor,
  fixedSize = false,
  children,
  style,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-bold select-none'

  const variants: Record<string, string> = {
    default:
      'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]',
    live:
      'bg-[var(--accent-glow-subtle)] text-[var(--accent)] border border-[var(--accent)] shadow-xs',
    replay:
      'bg-[var(--session-sprint)]/15 text-[var(--session-sprint)] border border-[var(--session-sprint)]/40',
    outline:
      'border border-[var(--border)] text-[var(--text-muted)] bg-transparent',
    neutral:
      'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border-subtle)]',
    accent:
      'bg-[var(--accent)] text-white shadow-xs',
    // Session badge variants (fixed width, same height)
    'session-fp':
      'bg-[var(--session-fp)] text-[var(--session-fp-text)] border border-transparent shadow-xs',
    'session-qual':
      'bg-[var(--session-qual)] text-white border border-transparent shadow-xs',
    'session-sprint':
      'bg-[var(--session-sprint)] text-white border border-transparent shadow-xs',
    'session-race':
      'bg-[var(--session-race)] text-white border border-transparent shadow-xs',
    // Tyre compound badges
    'tyre-soft':
      'bg-[var(--tyre-soft)] text-white border border-transparent',
    'tyre-medium':
      'bg-[var(--tyre-medium)] text-[var(--session-fp-text)] border border-transparent',
    'tyre-hard':
      'bg-[var(--tyre-hard)] text-[var(--text)] border border-[var(--border)]',
    'tyre-inter':
      'bg-[var(--tyre-inter)] text-white border border-transparent',
    'tyre-wet':
      'bg-[var(--tyre-wet)] text-white border border-transparent',
  }

  const customStyle = teamColor
    ? {
        backgroundColor: `${teamColor}18`,
        borderColor: `${teamColor}50`,
        color: teamColor,
        ...style,
      }
    : style

  return (
    <span
      className={cn(
        base,
        variants[variant] || variants.default,
        fixedSize && 'w-14 h-6 shrink-0',
        className
      )}
      style={customStyle}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      <span>{children}</span>
    </span>
  )
}
