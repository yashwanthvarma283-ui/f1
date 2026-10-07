import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

/**
 * High-performance transform-based skeleton shimmer (1.4s).
 * Adheres to F1 design guidelines: exact geometry and radius mimic,
 * zero layout shift when real data renders.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  rounded = 'md',
  ...props
}) => {
  const roundMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={cn(
        'skeleton-shimmer',
        roundMap[rounded],
        className
      )}
      {...props}
    />
  )
}
