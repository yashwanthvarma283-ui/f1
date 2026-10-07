import React, { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

/**
 * Scroll-triggered number count-up component.
 * Uses IntersectionObserver to count up smoothly once when scrolled into view.
 * Respects prefers-reduced-motion (renders instantly).
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return value
    }
    return 0
  })

  const containerRef = useRef<HTMLSpanElement>(null)
  const hasAnimatedRef = useRef<boolean>(false)

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) return

    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true
          observer.disconnect()

          const startTime = performance.now()
          const startVal = 0
          const endVal = value

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease-out cubic bezier (.22, 1, .36, 1) approximation
            const easeOutProgress = 1 - Math.pow(1 - progress, 3)
            const currentVal = startVal + (endVal - startVal) * easeOutProgress

            setDisplayValue(currentVal)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setDisplayValue(endVal)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [value, duration])

  return (
    <span ref={containerRef} className={`tabular-nums ${className}`}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  )
}
