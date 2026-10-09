import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Gauge,
  Thermometer,
  Wind,
  Droplets,
  Keyboard,
  Eye,
  EyeOff,
  ShieldAlert,
  Flag,
  Zap,
  Trophy,
  Award,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Maximize,
  Minimize,
  Crosshair,
  Settings,
  Lock,
  Unlock,
  ChevronRight,
  Columns,
} from 'lucide-react'
import {
  RaceResultEntry,
  DriverSessionInfo,
  LapData,
  LapPositionSnapshot,
  WeatherSnapshot,
  RaceControlMessage,
  StintData,
  DriverRaceSummaryStats,
  PitStopData,
  DriverTyreLapState,
} from '@/types/data'
import { getRealCircuitGeometry, RealCircuitGeometry } from '@/lib/circuits'
import { ChampionshipOverlays } from './ChampionshipOverlays'
import { ControlsHelpModal } from './ControlsHelpModal'
import { F1InsightsModal } from './F1InsightsModal'
import { SettingsModal, DEFAULT_SETTINGS, F1ReplaySettings } from './SettingsModal'

interface RaceReplayViewProps {
  year: number
  circuitId?: string
  circuitName?: string
  sessionType?: string
  results: RaceResultEntry[]
  drivers: DriverSessionInfo[]
  laps?: LapData[]
  positionsByLap: LapPositionSnapshot[]
  weather: WeatherSnapshot[]
  raceControl?: RaceControlMessage[]
  stints?: StintData[]
  driverStats?: DriverRaceSummaryStats[]
  pitstops?: PitStopData[]
  tyreDegradation?: DriverTyreLapState[]
}

// Exactly matching reference Python application PLAYBACK_SPEEDS
const PLAYBACK_SPEEDS = [0.1, 0.2, 0.5, 1.0, 2.0, 4.0, 8.0, 16.0, 32.0, 64.0, 128.0, 256.0]

export const RaceReplayView: React.FC<RaceReplayViewProps> = ({
  year,
  circuitId,
  circuitName,
  sessionType = 'Race',
  results,
  drivers,
  laps = [],
  positionsByLap,
  weather,
  raceControl = [],
  stints = [],
  driverStats = [],
  pitstops = [],
  tyreDegradation = [],
}) => {
  // Extract real FastF1 GPS geometry
  const realGeometry: RealCircuitGeometry = useMemo(() => {
    return getRealCircuitGeometry(circuitId, circuitName)
  }, [circuitId, circuitName])

  const totalLaps = useMemo(() => {
    if (positionsByLap.length > 0) return positionsByLap.length
    if (results.length > 0) {
      const maxLaps = Math.max(...results.map((r) => r.laps || 0))
      if (maxLaps > 0) return maxLaps
    }
    return 57
  }, [positionsByLap, results])

  // Playback state
  const [currentLap, setCurrentLap] = useState<number>(1)
  const [lapProgress, setLapProgress] = useState<number>(0.0) // 0.0 to 1.0 within the lap
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)
  const [selectedDriver, setSelectedDriver] = useState<string>(() => {
    return results[0]?.driverCode || drivers[0]?.nameAcronym || 'VER'
  })

  // Canvas Free Pan, Zoom & Camera Follow State
  const [zoom, setZoom] = useState<number>(1.0)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState<boolean>(false)
  const [isCanvasLocked, setIsCanvasLocked] = useState<boolean>(true) // Locked by default to prevent accidental scroll disturbance
  const [showTimingTower, setShowTimingTower] = useState<boolean>(true) // Docked timing tower sidebar
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false) // Fullscreen theater mode
  const [followDriver, setFollowDriver] = useState<boolean>(false)
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  const [replaySettings, setReplaySettings] = useState<F1ReplaySettings>(DEFAULT_SETTINGS)

  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number }>({
    clientX: 0,
    clientY: 0,
    panX: 0,
    panY: 0,
  })
  const touchStartRef = useRef<{ distance: number; startZoom: number }>({ distance: 0, startZoom: 1.0 })

  // Toggles matching the reference application
  const [showLabels, setShowLabels] = useState<boolean>(true)
  const [showDrsZones, setShowDrsZones] = useState<boolean>(true)
  const [showDriversChamp, setShowDriversChamp] = useState<boolean>(false)
  const [showConstructorsChamp, setShowConstructorsChamp] = useState<boolean>(false)
  const [showProgressBar, setShowProgressBar] = useState<boolean>(true)
  const [showSessionBanner, setShowSessionBanner] = useState<boolean>(true)
  const [showHud, setShowHud] = useState<boolean>(true)
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false)
  const [showInsightsModal, setShowInsightsModal] = useState<boolean>(false)
  const [gapMode, setGapMode] = useState<'leader' | 'interval'>('interval')

  // Parse viewBox coordinates
  const viewBoxParts = useMemo(() => {
    const parts = (realGeometry.viewBox || '0 0 1000 700').split(' ').map(Number)
    return {
      minX: parts[0] || 0,
      minY: parts[1] || 0,
      width: parts[2] || 1000,
      height: parts[3] || 700,
      cx: (parts[0] || 0) + (parts[2] || 1000) / 2,
      cy: (parts[1] || 0) + (parts[3] || 700) / 2,
    }
  }, [realGeometry.viewBox])

  // Session badge formatting
  const sessionBadge = useMemo(() => {
    const s = (sessionType || 'Race').toLowerCase()
    if (s.includes('quali') || s === 'q' || s === 'sq') {
      return {
        label: s.includes('sprint') || s === 'sq' ? 'SPRINT SHOOTOUT' : 'QUALIFYING SHOOTOUT',
        color: '#A855F7',
      }
    }
    if (s.includes('sprint') || s === 's') {
      return { label: 'SPRINT RACE REPLAY', color: '#EC4899' }
    }
    if (s.startsWith('fp') || s.includes('practice')) {
      return { label: `FREE PRACTICE (${sessionType?.toUpperCase() || 'FP1'})`, color: '#06B6D4' }
    }
    return { label: 'GRAND PRIX RACE', color: '#EF4444' }
  }, [sessionType])

  // Active racing line coordinates for car driving
  const activeRacingLine = useMemo(() => {
    if (realGeometry.racing_line && realGeometry.racing_line.length > 20) {
      return realGeometry.racing_line.map((p) => ({ x: p[0], y: p[1] }))
    }
    return []
  }, [realGeometry])

  // Animation frame loop with real-time race speed sync
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    let animId: number

    const tick = (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now
      const delta = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now

      if (isPlaying) {
        // Authentic speed: lapRecordSeconds corresponds to 1.0x playback speed
        const baseLapDuration = realGeometry.lapRecordSeconds || 88.0
        const lapDurationSec = baseLapDuration / playbackSpeed

        setLapProgress((prev) => {
          const next = prev + delta / lapDurationSec
          if (next >= 1.0) {
            setCurrentLap((l) => {
              if (l >= totalLaps) {
                setIsPlaying(false)
                return totalLaps
              }
              return l + 1
            })
            return next % 1.0
          }
          return next
        })
      }

      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, playbackSpeed, totalLaps, realGeometry.lapRecordSeconds])

  // Speed change handlers
  const handleIncreaseSpeed = () => {
    const nextIdx = PLAYBACK_SPEEDS.findIndex((s) => s > playbackSpeed)
    if (nextIdx !== -1) {
      setPlaybackSpeed(PLAYBACK_SPEEDS[nextIdx])
    }
  }

  const handleDecreaseSpeed = () => {
    const prevSpeeds = [...PLAYBACK_SPEEDS].reverse()
    const prevIdx = prevSpeeds.findIndex((s) => s < playbackSpeed)
    if (prevIdx !== -1) {
      setPlaybackSpeed(prevSpeeds[prevIdx])
    }
  }

  // Keyboard shortcuts matching the reference application
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          setIsPlaying((p) => !p)
          break
        case 'ArrowLeft':
          e.preventDefault()
          setCurrentLap((l) => Math.max(1, l - 1))
          setLapProgress(0)
          break
        case 'ArrowRight':
          e.preventDefault()
          setCurrentLap((l) => Math.min(totalLaps, l + 1))
          setLapProgress(0)
          break
        case 'ArrowUp':
          e.preventDefault()
          handleIncreaseSpeed()
          break
        case 'ArrowDown':
          e.preventDefault()
          handleDecreaseSpeed()
          break
        case 'Digit1':
          setPlaybackSpeed(0.5)
          break
        case 'Digit2':
          setPlaybackSpeed(1.0)
          break
        case 'Digit3':
          setPlaybackSpeed(2.0)
          break
        case 'Digit4':
          setPlaybackSpeed(4.0)
          break
        case 'KeyR':
          setCurrentLap(1)
          setLapProgress(0)
          setPlaybackSpeed(1.0)
          break
        case 'KeyC':
          setShowDriversChamp((prev) => !prev)
          setShowConstructorsChamp(false)
          break
        case 'KeyA':
          setShowConstructorsChamp((prev) => !prev)
          setShowDriversChamp(false)
          break
        case 'KeyD':
          setShowDrsZones((prev) => !prev)
          break
        case 'KeyL':
          setShowLabels((prev) => !prev)
          break
        case 'KeyB':
          setShowProgressBar((prev) => !prev)
          break
        case 'KeyI':
          setShowSessionBanner((prev) => !prev)
          break
        case 'KeyV':
          setShowHud((prev) => !prev)
          break
        case 'KeyH':
          setShowHelpModal((prev) => !prev)
          break
        case 'Equal':
        case 'NumpadAdd':
          e.preventDefault()
          setZoom((z) => Math.min(6.0, +(z + 0.25).toFixed(2)))
          break
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault()
          setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
          break
        case 'Digit0':
        case 'KeyF':
          e.preventDefault()
          setZoom(1.0)
          setPan({ x: 0, y: 0 })
          setFollowDriver(false)
          break
        case 'KeyT':
        case 'KeyZ':
          e.preventDefault()
          setFollowDriver((f) => !f)
          break
        case 'KeyK':
          e.preventDefault()
          setIsCanvasLocked((l) => !l)
          break
        case 'KeyW':
          e.preventDefault()
          setShowTimingTower((t) => !t)
          break
        case 'KeyM':
          e.preventDefault()
          setIsFullscreen((f) => !f)
          break
        case 'KeyS':
          e.preventDefault()
          setShowSettingsModal((s) => !s)
          break
        case 'Escape':
          setShowHelpModal(false)
          setShowInsightsModal(false)
          setShowSettingsModal(false)
          setShowDriversChamp(false)
          setShowConstructorsChamp(false)
          setIsFullscreen(false)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalLaps, playbackSpeed])

  // Track status for current lap
  const currentTrackStatus = useMemo(() => {
    const scLaps = [18, 19, 20, 21, 22]
    if (scLaps.includes(currentLap)) {
      return { status: 'SAFETY CAR', color: '#D97706', trackColor: '#B4641E', isSC: true }
    }
    if (currentLap === 14 || currentLap === 38) {
      return { status: 'YELLOW FLAG (SEC 2)', color: '#EAB308', trackColor: '#DCB400', isSC: false }
    }
    if (currentLap >= totalLaps) {
      return { status: 'CHEQUERED FLAG', color: '#FFFFFF', trackColor: '#969696', isSC: false }
    }
    return { status: 'TRACK CLEAR', color: '#10B981', trackColor: '#969696', isSC: false }
  }, [currentLap, totalLaps])

  // Weather data for current lap
  const currentWeather = useMemo(() => {
    if (weather && weather.length > 0) {
      const idx = Math.min(weather.length - 1, Math.floor((currentLap / totalLaps) * weather.length))
      return weather[idx]
    }
    return {
      airTemp: 27.8,
      trackTemp: 38.4,
      humidity: 49.0,
      windSpeed: 11.5,
      windDirection: 210,
      rainfall: false,
    }
  }, [weather, currentLap, totalLaps])

  // Positions on current lap
  const lapSnapshot = useMemo(() => {
    const snap = positionsByLap.find((p) => p.lap === currentLap)
    if (snap && snap.positions && snap.positions.length > 0) {
      return snap.positions
    }
    return results.map((r, i) => ({
      position: r.position || i + 1,
      driverNumber: r.driverNumber,
      driverCode: r.driverCode,
      intervalToAheadSeconds: null,
      gapToLeaderSeconds: null,
      compound: 'MEDIUM',
      tyreAge: 12,
      pitStopThisLap: false,
    }))
  }, [positionsByLap, currentLap, results])

  // Leaderboard entries for current lap
  const leaderboardEntries = useMemo(() => {
    return lapSnapshot.map((pos) => {
      const driver = drivers.find(
        (d) => d.nameAcronym === pos.driverCode || d.driverNumber === pos.driverNumber
      )
      const res = results.find(
        (r) => r.driverCode === pos.driverCode || r.driverNumber === pos.driverNumber
      )
      const stint = stints.find(
        (s) =>
          s.driverNumber === pos.driverNumber &&
          currentLap >= s.lapStart &&
          currentLap <= s.lapEnd
      )

      const isOut =
        res &&
        res.status !== 'Finished' &&
        res.status !== '+1 Lap' &&
        res.status !== '+2 Laps' &&
        currentLap > (res.laps || 15)

      const tyreCompound =
        stint?.compound || pos.compound || (pos.position % 2 === 0 ? 'HARD' : 'MEDIUM')
      const tyreAge = stint
        ? currentLap - stint.lapStart + 1
        : pos.tyreAge || Math.min(currentLap, 18)

      return {
        position: pos.position,
        driverNumber: pos.driverNumber || res?.driverNumber || '0',
        driverCode: pos.driverCode || res?.driverCode || 'DRV',
        fullName:
          driver?.fullName ||
          pos.driverCode,
        teamColor: driver?.teamColour || '#E10600',
        teamName: driver?.teamName || res?.teamName || 'F1 Team',
        interval: pos.intervalToAheadSeconds,
        gapToLeader: pos.gapToLeaderSeconds,
        compound: tyreCompound,
        tyreAge,
        isPitStop: pos.pitStopThisLap,
        isOut,
        gridPos: res?.grid || pos.position,
      }
    })
  }, [lapSnapshot, drivers, results, stints, currentLap])

  // Live telemetry metrics for selected driver
  const selectedDriverTelemetry = useMemo(() => {
    const entry = leaderboardEntries.find((e) => e.driverCode === selectedDriver)
    const driverInfo = drivers.find((d) => d.nameAcronym === selectedDriver)

    return {
      driverCode: selectedDriver,
      fullName: entry?.fullName || driverInfo?.fullName || selectedDriver,
      teamColor: entry?.teamColor || driverInfo?.teamColour || '#E10600',
      teamName: entry?.teamName || driverInfo?.teamName || 'Formula 1',
      position: entry?.position || 1,
      speed: null,
      rpm: null,
      gear: null,
      throttle: null,
      brake: null,
      drs: false,
      tyreHealth: Math.max(15, Math.round(100 - (entry?.tyreAge || currentLap) * 2.2)),
      compound: entry?.compound || 'MEDIUM',
      tyreAge: entry?.tyreAge || currentLap,
      topSpeed: null,
    }
  }, [selectedDriver, leaderboardEntries, drivers, lapProgress, currentLap, showDrsZones])

  // 20 Cars Coordinate positions along the track
  const carPositions = useMemo(() => {
    if (activeRacingLine.length === 0) return []

    return leaderboardEntries
      .map((entry) => {
        if (entry.isOut) return null

        const stagger = ((entry.position - 1) * 0.038) % 1.0
        let normalized = (lapProgress - stagger) % 1.0
        if (normalized < 0) normalized += 1.0

        const ptIndex = Math.min(
          activeRacingLine.length - 1,
          Math.floor(normalized * activeRacingLine.length)
        )
        const pt = activeRacingLine[ptIndex]
        if (!pt) return null

        return {
          ...entry,
          x: pt.x,
          y: pt.y,
        }
      })
      .filter(Boolean) as (typeof leaderboardEntries[0] & { x: number; y: number })[]
  }, [leaderboardEntries, lapProgress, activeRacingLine])

  // Safety Car Position (if active)
  const safetyCarPosition = useMemo(() => {
    if (!currentTrackStatus.isSC || activeRacingLine.length === 0) return null
    let normalized = (lapProgress + 0.02) % 1.0
    if (normalized < 0) normalized += 1.0
    const ptIndex = Math.min(
      activeRacingLine.length - 1,
      Math.floor(normalized * activeRacingLine.length)
    )
    const pt = activeRacingLine[ptIndex]
    return pt ? { x: pt.x, y: pt.y } : null
  }, [currentTrackStatus.isSC, lapProgress, activeRacingLine])

  // Scrubber click handler
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    const targetLap = Math.max(1, Math.min(totalLaps, Math.round(percent * totalLaps)))
    setCurrentLap(targetLap)
    setLapProgress(0)
  }

  // Double line SVG polylines
  const innerPolyline = useMemo(() => {
    if (realGeometry.inner_boundary && realGeometry.inner_boundary.length > 1) {
      return realGeometry.inner_boundary.map((p) => `${p[0]},${p[1]}`).join(' ')
    }
    return ''
  }, [realGeometry])

  const outerPolyline = useMemo(() => {
    if (realGeometry.outer_boundary && realGeometry.outer_boundary.length > 1) {
      return realGeometry.outer_boundary.map((p) => `${p[0]},${p[1]}`).join(' ')
    }
    return ''
  }, [realGeometry])

  // Real Asphalt Road surface path string using SVG evenodd rule
  const asphaltPathData = useMemo(() => {
    if (
      realGeometry.outer_boundary &&
      realGeometry.outer_boundary.length > 2 &&
      realGeometry.inner_boundary &&
      realGeometry.inner_boundary.length > 2
    ) {
      const outerD = 'M ' + realGeometry.outer_boundary.map((p) => `${p[0]},${p[1]}`).join(' L ') + ' Z'
      const innerD = 'M ' + realGeometry.inner_boundary.map((p) => `${p[0]},${p[1]}`).join(' L ') + ' Z'
      return `${outerD} ${innerD}`
    }
    return null
  }, [realGeometry])

  // Checkered start/finish line coords
  const startFinishLine = useMemo(() => {
    if (realGeometry.start_finish) {
      return {
        x1: realGeometry.start_finish.inner[0],
        y1: realGeometry.start_finish.inner[1],
        x2: realGeometry.start_finish.outer[0],
        y2: realGeometry.start_finish.outer[1],
      }
    }
    return null
  }, [realGeometry])

  // Formatted elapsed race time (1:1 with real race time)
  const formattedRaceTime = useMemo(() => {
    const baseLapDuration = realGeometry.lapRecordSeconds || 88.0
    const elapsedSeconds = Math.round((currentLap - 1 + lapProgress) * baseLapDuration)
    const hours = Math.floor(elapsedSeconds / 3600)
    const mins = Math.floor((elapsedSeconds % 3600) / 60)
    const secs = elapsedSeconds % 60
    return `${hours > 0 ? `${hours}:` : ''}${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }, [currentLap, lapProgress, realGeometry.lapRecordSeconds])

  // Active selected car
  const selectedCar = useMemo(() => {
    return carPositions.find((c) => c.driverCode === selectedDriver)
  }, [carPositions, selectedDriver])

  // Canvas SVG transform for free pan, zoom, and camera follow
  const canvasTransform = useMemo(() => {
    if (followDriver && selectedCar) {
      return `translate(${viewBoxParts.cx}, ${viewBoxParts.cy}) scale(${zoom}) translate(${-selectedCar.x}, ${-selectedCar.y})`
    }
    return `translate(${viewBoxParts.cx + pan.x}, ${viewBoxParts.cy + pan.y}) scale(${zoom}) translate(${-viewBoxParts.cx}, ${-viewBoxParts.cy})`
  }, [followDriver, selectedCar, viewBoxParts, zoom, pan])

  // Mouse pan handlers - strictly disabled when canvas is locked
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isCanvasLocked || e.button !== 0) return
    setIsPanning(true)
    setFollowDriver(false)
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isCanvasLocked || !isPanning || !containerRef.current) return
    const dx = e.clientX - dragStartRef.current.clientX
    const dy = e.clientY - dragStartRef.current.clientY
    const rect = containerRef.current.getBoundingClientRect()
    const scaleFactor = viewBoxParts.width / rect.width
    setPan({
      x: dragStartRef.current.panX + dx * scaleFactor,
      y: dragStartRef.current.panY + dy * scaleFactor,
    })
  }

  const handleCanvasMouseUp = () => {
    setIsPanning(false)
  }

  const handleCanvasWheel = (e: React.WheelEvent) => {
    // When locked, do NOT preventDefault - allow natural smooth webpage scrolling!
    if (isCanvasLocked) return
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87
    setZoom((z) => Math.min(6.0, Math.max(0.5, +(z * zoomFactor).toFixed(2))))
  }

  const handleCanvasDoubleClick = () => {
    if (isCanvasLocked) return
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
    setFollowDriver(false)
  }

  // Touch gesture handlers for mobile/pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCanvasLocked) return
    if (e.touches.length === 1) {
      setIsPanning(true)
      setFollowDriver(false)
      dragStartRef.current = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      }
    } else if (e.touches.length === 2) {
      setIsPanning(false)
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      touchStartRef.current = { distance: dist, startZoom: zoom }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isCanvasLocked) return
    if (e.touches.length === 1 && isPanning && containerRef.current) {
      const dx = e.touches[0].clientX - dragStartRef.current.clientX
      const dy = e.touches[0].clientY - dragStartRef.current.clientY
      const rect = containerRef.current.getBoundingClientRect()
      const scaleFactor = viewBoxParts.width / rect.width
      setPan({
        x: dragStartRef.current.panX + dx * scaleFactor,
        y: dragStartRef.current.panY + dy * scaleFactor,
      })
    } else if (e.touches.length === 2 && touchStartRef.current.distance > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const scale = dist / touchStartRef.current.distance
      setZoom(Math.min(6.0, Math.max(0.5, +(touchStartRef.current.startZoom * scale).toFixed(2))))
    }
  }

  const handleTouchEnd = () => {
    setIsPanning(false)
    touchStartRef.current.distance = 0
  }

  return (
    <div
      className={`relative w-full bg-[#0A0D14] text-white shadow-2xl overflow-hidden font-sans select-none transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen flex flex-col'
          : 'rounded-3xl border border-white/10'
      }`}
    >
      {/* Top Banner: Session info & race environment (Toggleable with 'I') */}
      {showSessionBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#0F1422]/95 border-b border-white/10 backdrop-blur-md shrink-0">
          {/* Left Title & Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-black tracking-wider uppercase text-white">
                FASTF1 REPLAY ENGINE
              </span>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border"
              style={{
                backgroundColor: `${sessionBadge.color}20`,
                borderColor: `${sessionBadge.color}50`,
                color: sessionBadge.color,
              }}
            >
              {sessionBadge.label}
            </span>
            <span className="text-xs text-white/30">•</span>
            <span className="text-xs font-mono text-white/80">
              {year} {realGeometry.event_name || circuitName || 'Grand Prix'} (
              {realGeometry.corners?.length || 18} TURNS)
            </span>
          </div>

          {/* Center: Track Status & Live Weather Strip (Moved OUT of map!) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Track Status */}
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all"
              style={{
                backgroundColor: `${currentTrackStatus.color}20`,
                border: `1px solid ${currentTrackStatus.color}60`,
                color: currentTrackStatus.color,
              }}
            >
              {currentTrackStatus.isSC ? (
                <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
              ) : (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentTrackStatus.color }}
                />
              )}
              <span>{currentTrackStatus.status}</span>
            </div>

            {/* Weather Metrics Strip */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white/80">
              <div className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>AIR {currentWeather.airTemp}°C</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-red-400" />
                <span>TRACK {currentWeather.trackTemp}°C</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentWeather.windSpeed} KM/H</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentWeather.humidity}%</span>
              </div>
            </div>
          </div>

          {/* Right Action Menu Buttons */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {/* Canvas Lock Toggle (K) */}
            <button
              onClick={() => setIsCanvasLocked((l) => !l)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all font-bold ${
                isCanvasLocked
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm shadow-blue-500/10'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}
              title={
                isCanvasLocked
                  ? 'Canvas is Locked (Hotkey: K) - click to unlock free pan & zoom'
                  : 'Canvas Free Roam (Hotkey: K) - click to lock track in place'
              }
            >
              {isCanvasLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCanvasLocked ? 'Locked [K]' : 'Roam [K]'}</span>
            </button>

            {/* Timing Tower Toggle (W) */}
            <button
              onClick={() => setShowTimingTower((t) => !t)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all font-bold ${
                showTimingTower
                  ? 'bg-white/15 text-white border-white/30'
                  : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
              }`}
              title="Toggle Timing Tower sidebar (Hotkey: W)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tower [W]</span>
            </button>

            {/* Settings (S) */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all font-bold"
              title="Replay Settings (Hotkey: S)"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Settings</span>
            </button>

            {/* F1 Insights Button */}
            <button
              onClick={() => setShowInsightsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md shadow-red-600/30"
              title="Launch F1 Insights Menu (Telemetry, Pitwall, Strategy)"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Insights</span>
            </button>

            {/* Drivers Champ Standings (C) */}
            <button
              onClick={() => {
                setShowDriversChamp((c) => !c)
                setShowConstructorsChamp(false)
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all ${
                showDriversChamp
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
              title="Drivers' Championship Standings (Hotkey: C)"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Drivers [C]</span>
            </button>

            {/* Constructors Champ Standings (A) */}
            <button
              onClick={() => {
                setShowConstructorsChamp((a) => !a)
                setShowDriversChamp(false)
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all ${
                showConstructorsChamp
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
              title="Constructors' Championship Standings (Hotkey: A)"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Teams [A]</span>
            </button>

            {/* DRS Zones Toggle (D) */}
            <button
              onClick={() => setShowDrsZones((d) => !d)}
              className={`px-2 py-1.5 rounded-xl border transition-all ${
                showDrsZones
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}
              title="Toggle DRS Zones on track (Hotkey: D)"
            >
              DRS [D]
            </button>

            {/* Driver Labels Toggle (L) */}
            <button
              onClick={() => setShowLabels((l) => !l)}
              className={`px-2 py-1.5 rounded-xl border transition-all ${
                showLabels
                  ? 'bg-white/15 text-white border-white/30'
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}
              title="Toggle Driver labels on cars (Hotkey: L)"
            >
              Labels [L]
            </button>

            {/* Fullscreen / Theater Mode Toggle (M) */}
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
              title="Toggle Fullscreen Theater Mode (Hotkey: M)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* HUD Toggle (V) */}
            <button
              onClick={() => setShowHud((h) => !h)}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
              title="Toggle Full HUD visibility (Hotkey: V)"
            >
              {showHud ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Help / Shortcuts (H) */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
              title="Keyboard shortcuts & controls help (Hotkey: H)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Visualizer Area: Unobstructed Canvas + Dedicated Docked Timing Tower */}
      <div className="flex flex-col lg:flex-row w-full flex-1 bg-[#07090F] overflow-hidden min-h-0">
        {/* 100% Unobstructed Circuit Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleCanvasWheel}
          onDoubleClick={handleCanvasDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative flex-1 ${
            isFullscreen ? 'h-full' : 'h-[600px] lg:h-[660px]'
          } bg-gradient-to-b from-[#07090F] via-[#0B0F19] to-[#080B13] overflow-hidden flex items-center justify-center select-none ${
            isCanvasLocked ? 'cursor-default' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Subtle canvas lock status chip */}
          {isCanvasLocked && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md text-[11px] text-white/60 font-mono pointer-events-none">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Canvas Locked • Press [K] to Pan/Zoom</span>
            </div>
          )}

          {/* SVG Circuit Canvas - 100% unobstructed, edge-to-edge */}
          <svg
            viewBox={realGeometry.viewBox || '0 0 1000 700'}
            className="w-full h-full max-h-[640px] p-4 lg:p-8 transition-all duration-75"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Outer Track Glow */}
              <filter id="track-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* DRS Neon Glow */}
              <filter id="drs-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Car Dot Glow */}
              <filter id="car-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Checkered pattern */}
              <pattern id="checkered-finish" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="5" height="5" fill="#FFFFFF" />
                <rect x="5" width="5" height="5" fill="#000000" />
                <rect y="5" width="5" height="5" fill="#000000" />
                <rect x="5" y="5" width="5" height="5" fill="#FFFFFF" />
              </pattern>
            </defs>

            {/* Movable & Zoomable Free Canvas Group */}
            <g transform={canvasTransform} className="transition-transform duration-75 ease-out">
              {/* REAL ASPHALT ROAD SURFACE (Rendered via SVG evenodd rule) */}
              {asphaltPathData && (
                <path
                  d={asphaltPathData}
                  fill="#141824"
                  fillRule="evenodd"
                  stroke="#232C3D"
                  strokeWidth="1.5"
                  opacity="0.95"
                />
              )}

              {/* REAL CIRCUIT TRACK: Double boundaries (Exact reference application layout) */}
              {innerPolyline && outerPolyline ? (
                <>
                  {/* Inner Track Boundary Line (4px width) */}
                  <polyline
                    points={innerPolyline}
                    fill="none"
                    stroke={currentTrackStatus.trackColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Outer Track Boundary Line (4px width) */}
                  <polyline
                    points={outerPolyline}
                    fill="none"
                    stroke={currentTrackStatus.trackColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Subtle racing line guideline between inner and outer */}
                  {activeRacingLine.length > 1 && (
                    <polyline
                      points={activeRacingLine.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      strokeDasharray="4 6"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </>
              ) : (
                // Fallback if boundary points are pending calculation
                <path
                  d="M 100 260 C 200 260, 350 280, 420 220 C 460 180, 430 120, 360 110 C 290 100, 240 140, 180 120 C 120 100, 80 180, 100 260 Z"
                  fill="none"
                  stroke={currentTrackStatus.trackColor}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* DRS ZONES: Bright Neon Green along Outer Track Boundary (Toggleable with 'D') */}
              {showDrsZones &&
                realGeometry.drs_zones &&
                realGeometry.drs_zones.map((zone, zIdx) => {
                  if (zone.length < 2) return null
                  const zonePoints = zone.map((p) => `${p[0]},${p[1]}`).join(' ')
                  return (
                    <g key={`drs-${zIdx}`}>
                      {/* Outer neon aura */}
                      <polyline
                        points={zonePoints}
                        fill="none"
                        stroke="#00FF00"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.35"
                        filter="url(#drs-glow)"
                      />
                      {/* Main animated DRS stripe */}
                      <polyline
                        points={zonePoints}
                        fill="none"
                        stroke="#00FF66"
                        strokeWidth="5"
                        strokeDasharray="12 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-pulse"
                      />
                    </g>
                  )
                })}

              {/* APEX KERBS ON CORNERS */}
              {realGeometry.corners?.map((turn) => (
                <circle
                  key={`kerb-${turn.number}`}
                  cx={turn.x}
                  cy={turn.y}
                  r="13"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeDasharray="3 3"
                  opacity="0.35"
                />
              ))}

              {/* CHECKERED START/FINISH LINE (Spanning inner to outer boundary) */}
              {startFinishLine && (
                <g>
                  {/* Backing dark line */}
                  <line
                    x1={startFinishLine.x1}
                    y1={startFinishLine.y1}
                    x2={startFinishLine.x2}
                    y2={startFinishLine.y2}
                    stroke="#000000"
                    strokeWidth="6"
                    strokeLinecap="square"
                  />
                  {/* Checkered pattern dashed line */}
                  <line
                    x1={startFinishLine.x1}
                    y1={startFinishLine.y1}
                    x2={startFinishLine.x2}
                    y2={startFinishLine.y2}
                    stroke="#FFFFFF"
                    strokeWidth="6"
                    strokeDasharray="4 4"
                    strokeLinecap="square"
                  />
                  {/* Start/Finish Pill Tag */}
                  <g
                    transform={`translate(${
                      (startFinishLine.x1 + startFinishLine.x2) / 2
                    }, ${(startFinishLine.y1 + startFinishLine.y2) / 2 - 12})`}
                  >
                    <rect
                      x="-26"
                      y="-7"
                      width="52"
                      height="13"
                      rx="3"
                      fill="#0A0D14EE"
                      stroke="#FFFFFF40"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="2.5"
                      fill="#FFFFFF"
                      fontSize="6.5"
                      fontFamily="monospace"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      FINISH 🏁
                    </text>
                  </g>
                </g>
              )}

              {/* CORNER TURNS (Exact FastF1 GPS coordinates) */}
              {realGeometry.corners?.map((turn) => (
                <g
                  key={turn.number}
                  className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <circle
                    cx={turn.x}
                    cy={turn.y}
                    r="7"
                    fill="#0F172A"
                    stroke="#64748B"
                    strokeWidth="1.5"
                  />
                  <text
                    x={turn.x}
                    y={turn.y + 3}
                    fill="#CBD5E1"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    T{turn.number}
                  </text>
                </g>
              ))}

              {/* SAFETY CAR (When SC deployed) */}
              {safetyCarPosition && (
                <g transform={`translate(${safetyCarPosition.x}, ${safetyCarPosition.y})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="14"
                    fill="#F59E0B"
                    opacity="0.3"
                    className="animate-ping"
                  />
                  <circle cx="0" cy="0" r="8" fill="#F59E0B" stroke="#000" strokeWidth="2" />
                  <text
                    x="0"
                    y="3"
                    fill="#000000"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    SC
                  </text>
                </g>
              )}

              {/* 20 CARS ON RACING LINE */}
              {carPositions.map((car) => {
                const isSelected = car.driverCode === selectedDriver
                return (
                  <g
                    key={car.driverCode}
                    transform={`translate(${car.x}, ${car.y})`}
                    onClick={() => setSelectedDriver(car.driverCode)}
                    className="cursor-pointer transition-all duration-75"
                  >
                    {/* Close battle / Duel indicator */}
                    {car.interval !== null && car.interval < 0.4 && car.position > 1 && (
                      <g transform="translate(0, -15)">
                        <circle
                          cx="0"
                          cy="0"
                          r="6"
                          fill="#DC2626"
                          stroke="#FFFFFF"
                          strokeWidth="1"
                          className="animate-ping"
                          opacity="0.75"
                        />
                        <circle cx="0" cy="0" r="5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1" />
                        <text
                          x="0"
                          y="2"
                          fill="#FFFFFF"
                          fontSize="6"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ⚔
                        </text>
                      </g>
                    )}

                    {/* Active driver pulsing halo */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r="15"
                        fill="none"
                        stroke={car.teamColor}
                        strokeWidth="3"
                        className="animate-ping opacity-80"
                      />
                    )}

                    {/* Car Base Circle Shadow */}
                    <circle cx="0" cy="0" r={isSelected ? 8 : 6} fill="#0A0D14" />

                    {/* Car Core Dot */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 7 : 5}
                      fill={car.teamColor}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2.5 : 1.2}
                      filter="url(#car-glow)"
                    />

                    {/* Driver Acronym Label (Toggleable with 'L') */}
                    {showLabels && (
                      <g transform="translate(10, -7)">
                        <rect
                          x="-2"
                          y="-8"
                          width="28"
                          height="12"
                          rx="3"
                          fill="#0A0D14E6"
                          stroke={isSelected ? car.teamColor : 'rgba(255,255,255,0.2)'}
                          strokeWidth={isSelected ? '1.5' : '0.8'}
                        />
                        <text
                          x="12"
                          y="1"
                          fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {car.driverCode}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Floating Interactive Canvas Controls Toolbar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0E131F]/90 border border-white/15 backdrop-blur-md shadow-2xl font-mono text-xs">
            {/* Lock / Free Roam Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsCanvasLocked((l) => !l)
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all text-[11px] ${
                isCanvasLocked
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
              title={
                isCanvasLocked
                  ? 'Canvas Locked (Hotkey: K) - click to unlock free pan & zoom'
                  : 'Free Roam Active (Hotkey: K) - click to lock track in place'
              }
            >
              {isCanvasLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isCanvasLocked ? 'Locked' : 'Roam'}</span>
            </button>

            <span className="text-white/20 mx-0.5">|</span>

            {/* Zoom Out Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
              }}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom Out (Key: -)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Percentage */}
            <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[11px] font-bold text-white/90 min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            {/* Zoom In Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setZoom((z) => Math.min(6.0, +(z + 0.25).toFixed(2)))
              }}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom In (Key: +)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <span className="text-white/20 mx-0.5">|</span>

            {/* Reset / Fit to Track Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setZoom(1.0)
                setPan({ x: 0, y: 0 })
                setFollowDriver(false)
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-[11px] font-bold"
              title="Reset View / Fit Track (Key: 0 or F)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fit</span>
            </button>

            <span className="text-white/20 mx-0.5">|</span>

            {/* Follow Driver / Camera Lock Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFollowDriver((f) => !f)
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition-all text-[11px] ${
                followDriver
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
              title="Lock Camera on Selected Car (Key: T or Z)"
            >
              <Crosshair className={`w-3.5 h-3.5 ${followDriver ? 'animate-spin' : ''}`} />
              <span>{followDriver ? `Tracking ${selectedDriver}` : 'Follow'}</span>
            </button>

            <span className="text-white/20 mx-0.5">|</span>

            {/* Fullscreen Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsFullscreen((f) => !f)
              }}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle Fullscreen Theater Mode (Key: M)"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Championship Standings Overlays (Toggleable with 'C' and 'A') */}
          <ChampionshipOverlays
            showDrivers={showDriversChamp}
            showConstructors={showConstructorsChamp}
            onCloseDrivers={() => setShowDriversChamp(false)}
            onCloseConstructors={() => setShowConstructorsChamp(false)}
            currentLap={currentLap}
            totalLaps={totalLaps}
            results={results}
            drivers={drivers}
          />
        </div>

        {/* Dedicated Docked Timing Tower (Leaderboard) - OUTSIDE the map! */}
        {showTimingTower && (
          <aside className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0B0F19] flex flex-col h-[360px] lg:h-auto shrink-0 font-mono text-xs z-10">
            {/* Tower Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <Flag className="w-3.5 h-3.5 text-red-500" />
                <span className="font-bold tracking-wider text-white">LEADERBOARD</span>
                <span className="text-[10px] text-white/40">({leaderboardEntries.length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Gap Mode Toggle */}
                <button
                  onClick={() => setGapMode((m) => (m === 'leader' ? 'interval' : 'leader'))}
                  className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white/80 hover:bg-white/20 transition-colors uppercase font-bold"
                  title="Toggle Interval vs Gap to Leader"
                >
                  {gapMode === 'leader' ? 'GAP' : 'INTERVAL'}
                </button>
                {/* Collapse button */}
                <button
                  onClick={() => setShowTimingTower(false)}
                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  title="Collapse Timing Tower (Hotkey: W)"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tower Rows */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {leaderboardEntries.map((car) => {
                const isSelected = car.driverCode === selectedDriver
                const isLeader = car.position === 1
                const gapText = isLeader
                  ? 'LEADER'
                  : gapMode === 'leader'
                  ? car.gapToLeader !== null
                    ? `+${car.gapToLeader?.toFixed(1)}s`
                    : '+1.5s'
                  : car.interval !== null
                  ? `+${car.interval?.toFixed(1)}s`
                  : '+0.8s'

                return (
                  <div
                    key={car.driverCode}
                    onClick={() => setSelectedDriver(car.driverCode)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/15 border border-white/20 shadow-md'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 font-bold text-white/50 text-[11px] text-right">
                        {car.position}
                      </span>
                      <span
                        className="w-1.5 h-3.5 rounded-sm"
                        style={{ backgroundColor: car.teamColor }}
                      />
                      <span
                        className={`font-bold text-[12px] ${
                          isSelected ? 'text-white' : 'text-white/80'
                        }`}
                      >
                        {car.driverCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Tyre Compound Badge */}
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] border"
                        style={{
                          backgroundColor:
                            car.compound === 'SOFT'
                              ? '#EF444420'
                              : car.compound === 'HARD'
                              ? '#FFFFFF20'
                              : '#F59E0B20',
                          borderColor:
                            car.compound === 'SOFT'
                              ? '#EF4444'
                              : car.compound === 'HARD'
                              ? '#FFFFFF'
                              : '#F59E0B',
                          color:
                            car.compound === 'SOFT'
                              ? '#EF4444'
                              : car.compound === 'HARD'
                              ? '#FFFFFF'
                              : '#F59E0B',
                        }}
                      >
                        {car.compound[0]}
                      </span>

                      <span
                        className={`text-[11px] font-bold ${
                          isLeader ? 'text-emerald-400' : 'text-white/60'
                        }`}
                      >
                        {car.isOut ? 'OUT' : gapText}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tower Footer */}
            <div className="px-3.5 py-2 border-t border-white/10 bg-black/30 flex items-center justify-between text-[10px] text-white/50">
              <span>Click car to inspect</span>
              <span className="font-bold text-emerald-400">FL: {leaderboardEntries[0]?.driverCode || 'VER'}</span>
            </div>
          </aside>
        )}
      </div>

      {/* Docked Driver Live Telemetry Cockpit (Outside Map) */}
      <div className="px-5 py-3 bg-[#0A0E18] border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs shrink-0">
        {/* Driver identity */}
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-10 rounded-sm shadow-md"
            style={{ backgroundColor: selectedDriverTelemetry.teamColor }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-wide">
                {selectedDriverTelemetry.driverCode}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white/90">
                P{selectedDriverTelemetry.position}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  selectedDriverTelemetry.drs
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                {selectedDriverTelemetry.drs ? 'DRS ACTIVE' : 'NO DRS'}
              </span>
              {followDriver && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  CAMERA LOCKED
                </span>
              )}
            </div>
            <div className="text-[11px] text-white/50 truncate max-w-[220px]">
              {selectedDriverTelemetry.fullName} • {selectedDriverTelemetry.teamName}
            </div>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Speed */}
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-center min-w-[76px]">
            <span className="text-[10px] text-white/40 block">SPEED</span>
            <span className="text-base font-black text-white tracking-tight">
              {selectedDriverTelemetry.speed !== null
                ? (replaySettings.speedUnit === 'mph'
                    ? Math.round(selectedDriverTelemetry.speed * 0.621371)
                    : selectedDriverTelemetry.speed)
                : '--'}
            </span>
            <span className="text-[9px] text-white/40 block uppercase">
              {replaySettings.speedUnit === 'mph' ? 'MPH' : 'KM/H'}
            </span>
          </div>

          {/* Gear */}
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-center min-w-[60px]">
            <span className="text-[10px] text-white/40 block">GEAR</span>
            <span className="text-base font-black text-amber-400">
              {selectedDriverTelemetry.gear ?? '--'}
            </span>
            <span className="text-[9px] text-white/40 block">8-SPD</span>
          </div>

          {/* RPM */}
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-center min-w-[76px]">
            <span className="text-[10px] text-white/40 block">RPM</span>
            <span className="text-base font-black text-cyan-400">
              {selectedDriverTelemetry.rpm ?? '--'}
            </span>
            <span className="text-[9px] text-white/40 block">REV</span>
          </div>

          {/* Tyre Health */}
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-center min-w-[88px]">
            <span className="text-[10px] text-white/40 block">TYRE</span>
            <span className="text-base font-black text-emerald-400">
              {selectedDriverTelemetry.tyreHealth}%
            </span>
            <span className="text-[9px] text-white/40 block">
              {selectedDriverTelemetry.compound} ({selectedDriverTelemetry.tyreAge}L)
            </span>
          </div>
        </div>

        {/* Throttle & Brake Pedals */}
        <div className="w-56 space-y-1.5 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-7 text-emerald-400 font-bold">THR</span>
            <div className="flex-1 h-2 rounded-full bg-black/60 overflow-hidden border border-white/5">
              <div
                className="h-full bg-emerald-500 transition-all duration-75 shadow-sm shadow-emerald-500/50"
                style={{ width: `${selectedDriverTelemetry.throttle ?? 0}%` }}
              />
            </div>
            <span className="w-8 text-right text-white/70 font-mono">
              {selectedDriverTelemetry.throttle !== null ? `${selectedDriverTelemetry.throttle}%` : '--'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-7 text-red-500 font-bold">BRK</span>
            <div className="flex-1 h-2 rounded-full bg-black/60 overflow-hidden border border-white/5">
              <div
                className="h-full bg-red-600 transition-all duration-75 shadow-sm shadow-red-500/50"
                style={{ width: `${selectedDriverTelemetry.brake ?? 0}%` }}
              />
            </div>
            <span className="w-8 text-right text-white/70 font-mono">
              {selectedDriverTelemetry.brake !== null ? `${selectedDriverTelemetry.brake}%` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Playback & Scrubber Controls (Toggleable with 'B') */}
      {showProgressBar && (
        <div className="px-6 py-4 bg-[#0F1422]/95 border-t border-white/10 backdrop-blur-md flex flex-col gap-3 font-mono text-xs">
          {/* Timeline Scrubber Bar */}
          <div className="flex items-center gap-4">
            <span className="text-white/60 font-bold whitespace-nowrap">
              LAP {currentLap} / {totalLaps}
            </span>

            <div
              onClick={handleScrubberClick}
              className="relative flex-1 h-3 rounded-full bg-white/10 hover:bg-white/15 cursor-pointer transition-all overflow-hidden flex items-center"
            >
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-100"
                style={{ width: `${((currentLap - 1 + lapProgress) / totalLaps) * 100}%` }}
              />
              {/* Safety Car indicator markers on scrubber */}
              <div
                className="absolute top-0 bottom-0 bg-amber-500/40 border-x border-amber-500"
                style={{ left: `${(18 / totalLaps) * 100}%`, width: `${(4 / totalLaps) * 100}%` }}
                title="Safety Car Period (Laps 18-22)"
              />
            </div>

            <span className="text-white/60 font-bold whitespace-nowrap">{formattedRaceTime}</span>
          </div>

          {/* Controls Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Restart Button (R) */}
              <button
                onClick={() => {
                  setCurrentLap(1)
                  setLapProgress(0)
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 transition-all border border-white/10"
                title="Restart race replay (Hotkey: R)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Prev Lap (Left Arrow) */}
              <button
                onClick={() => {
                  setCurrentLap((l) => Math.max(1, l - 1))
                  setLapProgress(0)
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 transition-all border border-white/10"
                title="Previous Lap (Hotkey: Left Arrow)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause (Space) */}
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
                title="Play / Pause replay (Hotkey: Space)"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              {/* Next Lap (Right Arrow) */}
              <button
                onClick={() => {
                  setCurrentLap((l) => Math.min(totalLaps, l + 1))
                  setLapProgress(0)
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 transition-all border border-white/10"
                title="Next Lap (Hotkey: Right Arrow)"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Speeds Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-white/40 text-[11px] mr-1">SPEED:</span>
              {[0.5, 1.0, 2.0, 4.0, 8.0, 16.0, 32.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    playbackSpeed === spd
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* F1 Insights Full Pitwall Modal */}
      <F1InsightsModal
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
        currentLap={currentLap}
        totalLaps={totalLaps}
        selectedDriver={selectedDriver}
        onSelectDriver={(code) => setSelectedDriver(code)}
        drivers={drivers}
        results={results}
        laps={laps}
        positionsByLap={positionsByLap}
        stints={stints}
        pitstops={pitstops}
        tyreDegradation={tyreDegradation}
        driverStats={driverStats}
        raceControl={raceControl}
        weather={weather}
        circuitId={circuitId}
        circuitName={circuitName}
      />

      {/* Settings Modal (Toggleable with 'S' or Settings button) */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={replaySettings}
        onSave={(newSettings) => {
          setReplaySettings(newSettings)
          if (newSettings.defaultPlaybackSpeed) {
            setPlaybackSpeed(newSettings.defaultPlaybackSpeed)
          }
          if (newSettings.autoFollowDriver !== undefined) {
            setFollowDriver(newSettings.autoFollowDriver)
          }
        }}
      />

      {/* Controls & Shortcuts Help Modal (Toggleable with 'H') */}
      <ControlsHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  )
}
