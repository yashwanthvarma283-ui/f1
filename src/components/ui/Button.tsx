import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

/**
 * F1 Interactive Button System:
 * - Primary CTA: angled/skewed accent cut, red fill that slides in on hover, arrow nudges 4px, 0.98 scale on press
 * - Secondary: semantic surface/border transition
 * - Visible focus-visible rings (WCAG AA compliant)
 * - Zero layout shift guarantee
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, children, disabled, ...props }, ref) => {
    const baseStyles =
      'group relative inline-flex items-center justify-center font-medium tracking-tight rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]'

    const variants = {
      primary:
        'relative overflow-hidden bg-[var(--accent)] text-white shadow-sm hover:shadow-[0_0_16px_var(--accent-glow)] font-semibold f1-skew before:absolute before:inset-0 before:bg-[var(--accent-hover)] before:-translate-x-full hover:before:translate-x-0 before:transition-transform before:duration-200 before:ease-out before:skew-x-[-12deg]',
      secondary:
        'bg-[var(--surface-1)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-2)] hover:border-[var(--text-muted)] transition-colors duration-200 shadow-xs font-medium',
      outline:
        'bg-transparent border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--text-muted)] transition-colors duration-200 font-medium',
      ghost:
        'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors duration-150',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span
          className={cn(
            'relative z-10 inline-flex items-center gap-1.5',
            variant === 'primary' && 'f1-unskew'
          )}
        >
          <span className="truncate">{children}</span>
          {icon && (
            <span className="shrink-0 transition-transform duration-150 group-hover:translate-x-1">
              {icon}
            </span>
          )}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'
