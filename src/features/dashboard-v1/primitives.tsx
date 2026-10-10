import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Shared primitives for dashboard-v2.
 * Type and spacing steps come straight from DESIGN.md; nothing here
 * hard-codes a colour.
 */

/** Em dash for any value the data does not provide. */
export const EMPTY = '—'

/** Renders a value, falling back to an em dash when it is missing. */
export function orDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY
  const str = String(value).trim()
  return str.length > 0 ? str : EMPTY
}

/** Tabular mono figure — every measurement on the page uses this. */
export const Figure: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <span className={cn('dv2-fig', className)}>{children}</span>
)

/** 11px uppercase tracked label. Used for column headers and fact labels. */
export const Label: React.FC<{
  children: React.ReactNode
  className?: string
  as?: 'span' | 'div' | 'th'
}> = ({ children, className, as = 'span' }) => {
  const Tag = as
  return (
    <Tag
      className={cn(
        'text-[11px] uppercase tracking-[0.1em] font-medium text-[var(--text-muted)]',
        className
      )}
    >
      {children}
    </Tag>
  )
}

/**
 * Left-aligned section heading with an optional action on the same baseline.
 * 48px above, 24px below — more space above than under, per the brief.
 */
export const SectionHeading: React.FC<{
  children: React.ReactNode
  action?: React.ReactNode
  id?: string
}> = ({ children, action, id }) => (
  <div className="flex items-end justify-between gap-4 mb-6">
    <h2
      id={id}
      className="font-[family-name:var(--font-display)] font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-[28px] md:text-[34px] lg:text-[40px] text-[var(--text)]"
    >
      {children}
    </h2>
    {action ? <div className="shrink-0 pb-1">{action}</div> : null}
  </div>
)

/** The single red accent rule for the whole page. Used once. */
export const AccentRule: React.FC = () => (
  <div className="dv2-accent-rule" role="presentation" />
)

/** Label-above-value fact, as used in the hero and the f1.com circuit panel. */
export const Fact: React.FC<{
  label: string
  value: React.ReactNode
  mono?: boolean
  index?: number
}> = ({ label, value, mono = false, index }) => (
  <div
    className="dv2-rise py-3 border-b border-[var(--dv2-hero-border)] last:border-b-0"
    style={index === undefined ? undefined : ({ '--dv2-i': Math.min(index, 5) } as React.CSSProperties)}
  >
    <div className="text-[11px] uppercase tracking-[0.1em] font-medium text-[var(--dv2-hero-muted)]">
      {label}
    </div>
    <div
      className={cn(
        'mt-1 text-[var(--dv2-hero-text)] font-semibold text-[17px] md:text-[19px]',
        mono && 'dv2-fig'
      )}
    >
      {value}
    </div>
  </div>
)

/** Primary action. Exactly one of these per view. */
export const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className, ...props }) => (
  <button
    type="button"
    className={cn(
      // 16px semibold keeps white-on-red above the AA large-text threshold
      'dv2-press inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full',
      'bg-[var(--accent)] text-white text-[16px] font-semibold',
      'hover:bg-[var(--accent-hover)] transition-colors duration-150',
      'focus-visible:outline-none cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </button>
)

/** Quiet one-line error with a retry affordance. No alarm colours. */
export const QuietError: React.FC<{
  message?: string
  onRetry?: () => void
}> = ({ message = 'This section could not be loaded.', onRetry }) => (
  <p className="text-[13px] text-[var(--text-muted)] py-6">
    {message}
    {onRetry ? (
      <>
        {' '}
        <button
          type="button"
          onClick={onRetry}
          className="dv2-link text-[var(--text)] font-medium underline cursor-pointer"
        >
          Try again
        </button>
      </>
    ) : null}
  </p>
)

/** Empty state that says what would appear here. */
export const EmptyNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[13px] text-[var(--text-muted)] py-6">{children}</p>
)

/**
 * Skeleton rows shaped like the final table, reusing the shared
 * .skeleton-shimmer class the capture script waits on.
 */
export const RowSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 6,
  className,
}) => (
  <div className={cn('divide-y divide-[var(--border-subtle)]', className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 h-14 md:h-16 px-4">
        <div className="skeleton-shimmer h-3 w-6 rounded-[4px]" />
        <div className="skeleton-shimmer h-3 flex-1 max-w-[200px] rounded-[4px]" />
        <div className="skeleton-shimmer h-3 w-24 rounded-[4px] hidden sm:block" />
        <div className="skeleton-shimmer h-3 w-10 rounded-[4px] ml-auto" />
      </div>
    ))}
  </div>
)

/** 2px team-colour marker. Never a fill, never wider than 2px. */
export const TeamMarker: React.FC<{
  color: string
  orientation?: 'vertical' | 'horizontal'
}> = ({ color, orientation = 'vertical' }) => (
  <span
    aria-hidden="true"
    className={cn(
      'block shrink-0',
      orientation === 'vertical' ? 'w-[2px] h-6' : 'h-[2px] w-full'
    )}
    style={{ backgroundColor: color }}
  />
)

/** Section wrapper with the standard vertical rhythm and scroll offset. */
export const Section: React.FC<{
  id: string
  children: React.ReactNode
  labelledBy?: string
}> = ({ id, children, labelledBy }) => (
  <section
    id={id}
    aria-labelledby={labelledBy}
    className="scroll-mt-[128px] py-16 md:py-24"
  >
    {children}
  </section>
)
