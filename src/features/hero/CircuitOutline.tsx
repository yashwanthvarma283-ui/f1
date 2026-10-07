import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { getCircuitInfo, TurnMarker } from '@/lib/circuits'

interface CircuitOutlineProps {
  circuitId?: string
  circuitName?: string
  className?: string
}

export const CircuitOutline: React.FC<CircuitOutlineProps> = ({
  circuitId,
  circuitName,
  className = 'w-full h-44 sm:h-52 md:h-60',
}) => {
  const info = getCircuitInfo(circuitId, circuitName)
  const shouldReduceMotion = useReducedMotion()

  const [activeTurn, setActiveTurn] = useState<TurnMarker | null>(null)
  const [sectorsVisible, setSectorsVisible] = useState(false)
  const [carPosition, setCarPosition] = useState<{ x: number; y: number } | null>(null)
  const [pathLength, setPathLength] = useState(1000)

  const pathRef = useRef<SVGPathElement>(null)
  const animFrameRef = useRef<number | null>(null)

  // Measure path length and orchestrate animation sequence
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength()
      setPathLength(len)

      if (shouldReduceMotion) {
        setSectorsVisible(true)
        return
      }

      // 1. Initial Path draws itself for 1.4s (ease-in-out)
      // 2. Sector colors fade in at 1.4s
      // 3. Car dot starts looping
      let startLoopTime: number | null = null
      const loopDurationMs = 8000 // 8s per lap loop

      const loopAnimation = (timestamp: number) => {
        if (!startLoopTime) startLoopTime = timestamp
        const elapsed = timestamp - startLoopTime
        const progress = (elapsed % loopDurationMs) / loopDurationMs

        if (pathRef.current) {
          const pt = pathRef.current.getPointAtLength(progress * len)
          setCarPosition({ x: pt.x, y: pt.y })
        }

        animFrameRef.current = requestAnimationFrame(loopAnimation)
      }

      const timer = setTimeout(() => {
        setSectorsVisible(true)
        animFrameRef.current = requestAnimationFrame(loopAnimation)
      }, 1400)

      return () => {
        clearTimeout(timer)
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current)
        }
      }
    }
  }, [info.path, shouldReduceMotion])

  const s1Len = pathLength * 0.333
  const s2Len = pathLength * 0.334
  const s3Len = pathLength * 0.333

  return (
    <div className="f1-card-accent relative flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-[var(--card-shadow)] overflow-hidden transition-all duration-200 hover:shadow-[var(--card-shadow-hover)]">
      {/* Circuit Metadata Header & Sector Legend */}
      <div className="w-full flex items-center justify-between text-xs font-mono mb-1.5 z-10">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text)] font-bold text-xs border border-[var(--border)]">
            {info.turns} TURNS
          </span>
          <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] font-semibold text-xs">
            {info.lengthKm}
          </span>
        </div>

        {/* Sector Legend */}
        <div className="flex items-center gap-3 text-xs uppercase font-bold tracking-tight">
          <span className="flex items-center gap-1 text-[var(--timing-purple)] font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--timing-purple)]" />
            S1
          </span>
          <span className="flex items-center gap-1 text-[var(--timing-green)] font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--timing-green)]" />
            S2
          </span>
          <span className="flex items-center gap-1 text-[var(--timing-yellow)] font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--timing-yellow)]" />
            S3
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full flex items-center justify-center my-2">
        <svg
          viewBox={info.viewBox}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base ghost track path */}
          <path
            d={info.path}
            stroke="var(--surface-3)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Reference path for measurement & car tracking */}
          <path ref={pathRef} d={info.path} stroke="none" fill="none" />

          {/* 1. Initial draw path (1.4s, ease-in-out) */}
          <motion.path
            d={info.path}
            stroke="var(--accent)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.4,
              ease: [0.65, 0, 0.35, 1], // --ease-in-out
            }}
          />

          {/* 2. Sector Colours that fade in after 1.4s */}
          {/* Sector 1: Purple (0 to 33%) */}
          <motion.path
            d={info.path}
            stroke="var(--timing-purple)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${s1Len} ${pathLength}`}
            strokeDashoffset="0"
            initial={{ opacity: 0 }}
            animate={{ opacity: sectorsVisible ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Sector 2: Green (33% to 66%) */}
          <motion.path
            d={info.path}
            stroke="var(--timing-green)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${s2Len} ${pathLength}`}
            strokeDashoffset={`-${s1Len}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: sectorsVisible ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Sector 3: Yellow (66% to 100%) */}
          <motion.path
            d={info.path}
            stroke="var(--timing-yellow)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${s3Len} ${pathLength}`}
            strokeDashoffset={`-${s1Len + s2Len}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: sectorsVisible ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Start / Finish line beacon */}
          <circle
            cx={info.startFinishPoint.x}
            cy={info.startFinishPoint.y}
            r="4.5"
            fill="var(--surface-1)"
            stroke="var(--accent)"
            strokeWidth="2"
          />

          {/* 3. Corner Numbers pop in with 20ms stagger (>=11px with dark halo pill, offset outward) */}
          {info.turnsData.map((turn, idx) => {
            const isHovered = activeTurn?.number === turn.number
            const sectorColor =
              turn.sector === 1
                ? 'var(--timing-purple)'
                : turn.sector === 2
                ? 'var(--timing-green)'
                : 'var(--timing-yellow)'

            const px = turn.pillX ?? turn.x
            const py = turn.pillY ?? turn.y
            const hasOffset = turn.pillX !== undefined && turn.pillY !== undefined
            const isDoubleDigit = turn.number >= 10
            const pillW = isDoubleDigit ? 22 : 18
            const pillH = 17

            return (
              <motion.g
                key={turn.number}
                className="cursor-pointer"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 1.4 + idx * 0.02, // 20ms stagger
                  duration: 0.25,
                }}
                onMouseEnter={() => setActiveTurn(turn)}
                onMouseLeave={() => setActiveTurn(null)}
              >
                {/* Hairline connector from track apex to outward pill */}
                {hasOffset && (
                  <line
                    x1={turn.x}
                    y1={turn.y}
                    x2={px}
                    y2={py}
                    stroke={sectorColor}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={isHovered ? 0.9 : 0.5}
                  />
                )}

                {/* Track apex marker dot */}
                <circle
                  cx={turn.x}
                  cy={turn.y}
                  r={isHovered ? 3.5 : 2.5}
                  fill={sectorColor}
                  stroke="var(--surface-1)"
                  strokeWidth="1"
                  className="transition-all duration-150"
                />

                {/* Dark Halo Pill behind corner number (100% readable on both themes) */}
                <rect
                  x={px - pillW / 2}
                  y={py - pillH / 2}
                  width={pillW}
                  height={pillH}
                  rx="4"
                  fill="#0B0B0F"
                  stroke={isHovered ? 'var(--text)' : sectorColor}
                  strokeWidth={isHovered ? 2 : 1.2}
                  className="transition-all duration-150"
                />

                {/* Corner Number: >=11px, bold, centered in pill */}
                <text
                  x={px}
                  y={py + 3.8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                  fill="#FFFFFF"
                  pointerEvents="none"
                >
                  {turn.number}
                </text>
              </motion.g>
            )
          })}

          {/* 4. Car Dot Looping the Track */}
          {!shouldReduceMotion && carPosition && (
            <g>
              {/* Outer soft pulse ring */}
              <circle
                cx={carPosition.x}
                cy={carPosition.y}
                r="7"
                fill="var(--accent)"
                opacity="0.35"
              />
              {/* Inner crisp car beacon dot */}
              <circle
                cx={carPosition.x}
                cy={carPosition.y}
                r="3.5"
                fill="var(--surface-1)"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip (Fade + scale in 120ms) */}
        <AnimatePresence>
          {activeTurn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 4 }}
              transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }} // --dur-fast
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] shadow-xl text-center"
            >
              <div className="flex items-center gap-1.5 justify-center">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      activeTurn.sector === 1
                        ? 'var(--timing-purple)'
                        : activeTurn.sector === 2
                        ? 'var(--timing-green)'
                        : 'var(--timing-yellow)',
                  }}
                />
                <span className="font-display font-bold text-xs uppercase tracking-tight text-[var(--text)]">
                  {activeTurn.name || `Turn ${activeTurn.number}`}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] font-semibold">
                  &bull; Sector {activeTurn.sector}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lap Record & Circuit Details Footer */}
      {info.lapRecord && (
        <div className="w-full pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
          <span className="font-bold tracking-tight text-xs text-[var(--text-muted)]">LAP RECORD</span>
          <span className="text-xs text-[var(--text)] font-semibold truncate max-w-[280px]">
            {info.lapRecord}
          </span>
        </div>
      )}
    </div>
  )
}
