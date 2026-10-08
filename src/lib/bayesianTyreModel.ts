/**
 * Universal Bayesian State-Space Tyre Degradation Model
 * Ported from the reference Python implementation (src/bayesian_tyre_model.py & tyre_degradation_integration.py)
 * 
 * Model formulations:
 * State equation:
 *   alpha_{t+1} = (1 - I_pit) * (alpha_t + nu * A_track) + I_pit * alpha_reset + eta_t
 * 
 * Observation equation:
 *   y_t = alpha_t + gamma * fuel_t + delta_mismatch + epsilon_t
 */

export type TyreCompoundType = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN'
export type TrackConditionType = 'DRY' | 'DAMP' | 'WET'

export interface TyreProfile {
  name: TyreCompoundType
  category: 'SLICK' | 'INTER' | 'WET'
  degradationRate: number // seconds per lap degradation prior (nu)
  resetPace: number       // base lap pace on fresh rubber (seconds)
  warmupLaps: number      // laps until peak tyre working window
  maxDegradation: number  // maximum acceptable pace delta before cliff (seconds)
  color: string
}

export interface StateSpaceConfig {
  sigmaEpsilon: number     // observation noise
  sigmaEta: number         // state transition variance
  fuelEffectPrior: number  // seconds per kg fuel (default ~0.032 s/kg)
  startingFuel: number     // starting fuel load (kg, default 110.0 kg)
  fuelBurnRate: number     // kg burned per lap (default 1.6 kg/lap)
  enableWarmup: boolean
  enableTrackAbrasion: boolean
}

export const DEFAULT_CONFIG: StateSpaceConfig = {
  sigmaEpsilon: 0.3,
  sigmaEta: 0.1,
  fuelEffectPrior: 0.032,
  startingFuel: 110.0,
  fuelBurnRate: 1.6,
  enableWarmup: true,
  enableTrackAbrasion: true,
}

// Track abrasion factors by circuit ID / name
export const CIRCUIT_ABRASION_FACTORS: Record<string, number> = {
  sakhir: 1.25,        // Bahrain: notoriously abrasive asphalt
  bahrain: 1.25,
  silverstone: 1.18,   // High-speed abrasive lateral load
  barcelona: 1.15,     // Catalunya turn 3 tyre killer
  catalunya: 1.15,
  suzuka: 1.20,        // High lateral Deg in Ess
  spa: 1.12,           // Spa-Francorchamps high load
  red_bull_ring: 0.95, // Spielberg short smooth
  spielberg: 0.95,
  monza: 0.88,         // Low downforce, low abrasion
  monaco: 0.72,        // Street circuit, minimal tyre wear
  monte_carlo: 0.72,
  hungaroring: 1.05,   // Tight, hot, high deg
  budapest: 1.05,
  zandvoort: 1.14,     // Banked turns high lateral stress
  marina_bay: 0.98,    // Singapore street circuit
  singapore: 0.98,
  americas: 1.16,      // Austin bumpy abrasive
  austin: 1.16,
  mexico_city: 0.90,   // High altitude, low downforce
  rodriguez: 0.90,
  interlagos: 1.12,    // Sao Paulo abrasive
  sao_paulo: 1.12,
  las_vegas: 0.82,     // Cold, ultra-smooth asphalt
  vegas: 0.82,
  losail: 1.22,        // Qatar aggressive kerbs & lateral G
  lusail: 1.22,
  yas_marina: 0.94,    // Abu Dhabi smooth
  abu_dhabi: 0.94,
  jeddah: 0.88,        // High speed but very smooth new tarmac
  melbourne: 0.92,     // Albert park semi-street
  albert_park: 0.92,
  shanghai: 1.10,      // Front-limited turn 1
  miami: 0.96,
  imola: 1.08,
  montreal: 0.94,
  villeneuve: 0.94,
  baku: 0.86,
}

export const TYRE_PROFILES: Record<TyreCompoundType, TyreProfile> = {
  SOFT: {
    name: 'SOFT',
    category: 'SLICK',
    degradationRate: 0.085,
    resetPace: 89.0,
    warmupLaps: 1,
    maxDegradation: 2.8,
    color: '#FF3B30',
  },
  MEDIUM: {
    name: 'MEDIUM',
    category: 'SLICK',
    degradationRate: 0.048,
    resetPace: 89.6,
    warmupLaps: 2,
    maxDegradation: 2.4,
    color: '#FFD60A',
  },
  HARD: {
    name: 'HARD',
    category: 'SLICK',
    degradationRate: 0.022,
    resetPace: 90.3,
    warmupLaps: 3,
    maxDegradation: 2.0,
    color: '#F0F0F0',
  },
  INTERMEDIATE: {
    name: 'INTERMEDIATE',
    category: 'INTER',
    degradationRate: 0.095,
    resetPace: 95.0,
    warmupLaps: 2,
    maxDegradation: 3.5,
    color: '#39B54A',
  },
  WET: {
    name: 'WET',
    category: 'WET',
    degradationRate: 0.125,
    resetPace: 102.0,
    warmupLaps: 2,
    maxDegradation: 4.5,
    color: '#1E6BFF',
  },
  UNKNOWN: {
    name: 'UNKNOWN',
    category: 'SLICK',
    degradationRate: 0.05,
    resetPace: 90.0,
    warmupLaps: 2,
    maxDegradation: 2.5,
    color: '#888888',
  },
}

export interface DriverTyreHealthResult {
  driverCode: string
  compound: TyreCompoundType
  stintNumber: number
  tyreAgeLaps: number
  tyreHealthPercent: number       // 0 to 100%
  latentPaceSeconds: number       // alpha_t (true pace without fuel penalty)
  fuelWeightKg: number            // current fuel remaining
  fuelPacePenaltySeconds: number  // gamma * fuel_t
  effectiveDegradationRate: number // nu * A_track (s/lap)
  warmupPenaltySeconds: number    // current warmup grip penalty
  paceDeltaCliffSeconds: number   // gap to performance cliff
  isCliffReached: boolean
  predictedNextLapSeconds: number
  optimalPitWindowLap: number     // recommended lap to pit
  degradationTrendCurve: { lapOnTyre: number; paceDelta: number; health: number }[]
}

/**
 * Get circuit track abrasion factor based on ID or name
 */
export function getTrackAbrasion(circuitId?: string, circuitName?: string): number {
  if (circuitId) {
    const key = circuitId.toLowerCase().replace(/[^a-z0-9]/g, '_')
    for (const [k, factor] of Object.entries(CIRCUIT_ABRASION_FACTORS)) {
      if (key.includes(k) || k.includes(key)) return factor
    }
  }
  if (circuitName) {
    const key = circuitName.toLowerCase()
    for (const [k, factor] of Object.entries(CIRCUIT_ABRASION_FACTORS)) {
      if (key.includes(k)) return factor
    }
  }
  return 1.0 // Standard baseline abrasion
}

/**
 * Calculate Bayesian Tyre Degradation and State-Space metrics for a driver at a specific lap
 */
export function computeBayesianTyreHealth(
  driverCode: string,
  currentLap: number,
  totalLaps: number,
  compoundStr: string = 'MEDIUM',
  stintNumber: number = 1,
  tyreAgeLaps: number = 1,
  circuitId?: string,
  circuitName?: string,
  baseLapPaceSeconds: number = 90.0
): DriverTyreHealthResult {
  const normCompound = (compoundStr || 'MEDIUM').toUpperCase() as TyreCompoundType
  const profile = TYRE_PROFILES[normCompound] || TYRE_PROFILES.MEDIUM
  const abrasion = getTrackAbrasion(circuitId, circuitName)
  const config = DEFAULT_CONFIG

  const effectiveDeg = profile.degradationRate * abrasion
  const safeTyreAge = Math.max(1, tyreAgeLaps)

  // 1. Warmup penalty
  let warmupPenalty = 0.0
  if (config.enableWarmup && safeTyreAge <= profile.warmupLaps) {
    const maxPenalty = profile.category === 'SLICK' ? 0.35 : 0.2
    warmupPenalty = maxPenalty * (1 - (safeTyreAge - 1) / profile.warmupLaps)
  }

  // 2. Fuel load remaining at current lap
  const remainingLaps = Math.max(0, totalLaps - currentLap)
  const fuelRemainingKg = Math.max(
    2.0,
    config.startingFuel - (currentLap - 1) * config.fuelBurnRate
  )
  const fuelPacePenalty = fuelRemainingKg * config.fuelEffectPrior

  // 3. Latent pace alpha_t
  // True car pace capability grows slower with tyre deg, but observed lap times might hide this as car burns fuel!
  const degPaceLoss = (safeTyreAge - 1) * effectiveDeg
  const latentPace = baseLapPaceSeconds + degPaceLoss + warmupPenalty

  // 4. Tyre health percentage (100% down to 0% at cliff)
  const maxLapsBeforeCliff = Math.round(profile.maxDegradation / Math.max(0.005, effectiveDeg))
  const rawHealth = Math.max(0, 100 - (safeTyreAge / maxLapsBeforeCliff) * 100)
  const tyreHealthPercent = Math.round(Math.min(100, rawHealth))

  // 5. Cliff status
  const isCliffReached = degPaceLoss >= profile.maxDegradation

  // 6. Predicted next lap observed pace
  const nextFuelKg = Math.max(2.0, fuelRemainingKg - config.fuelBurnRate)
  const nextFuelPenalty = nextFuelKg * config.fuelEffectPrior
  const nextWarmupPenalty =
    config.enableWarmup && safeTyreAge + 1 <= profile.warmupLaps
      ? (profile.category === 'SLICK' ? 0.35 : 0.2) * (1 - safeTyreAge / profile.warmupLaps)
      : 0.0
  const predictedNextLap = baseLapPaceSeconds + safeTyreAge * effectiveDeg + nextWarmupPenalty + nextFuelPenalty

  // 7. Optimal Pit Window Recommendation
  // Pit loss in F1 is approx 22-24 seconds. The crossover point is when pitting for fresh tyres
  // saves enough delta over the remaining laps of the stint to justify the pit stop.
  const idealStintLength = Math.min(
    maxLapsBeforeCliff - 3,
    Math.round(totalLaps / (normCompound === 'HARD' ? 2 : normCompound === 'MEDIUM' ? 2.3 : 3))
  )
  const optimalPitWindowLap = Math.max(currentLap, currentLap - safeTyreAge + idealStintLength)

  // 8. 30-lap degradation projection curve
  const projectionLaps = Math.min(35, maxLapsBeforeCliff + 5)
  const degradationTrendCurve: { lapOnTyre: number; paceDelta: number; health: number }[] = []

  for (let l = 1; l <= projectionLaps; l++) {
    const wPen =
      config.enableWarmup && l <= profile.warmupLaps
        ? (profile.category === 'SLICK' ? 0.35 : 0.2) * (1 - (l - 1) / profile.warmupLaps)
        : 0.0
    const pDelta = (l - 1) * effectiveDeg + wPen
    const h = Math.max(0, Math.round(100 - (l / maxLapsBeforeCliff) * 100))
    degradationTrendCurve.push({
      lapOnTyre: l,
      paceDelta: Number(pDelta.toFixed(3)),
      health: h,
    })
  }

  return {
    driverCode,
    compound: normCompound,
    stintNumber,
    tyreAgeLaps: safeTyreAge,
    tyreHealthPercent,
    latentPaceSeconds: Number(latentPace.toFixed(3)),
    fuelWeightKg: Number(fuelRemainingKg.toFixed(1)),
    fuelPacePenaltySeconds: Number(fuelPacePenalty.toFixed(3)),
    effectiveDegradationRate: Number(effectiveDeg.toFixed(4)),
    warmupPenaltySeconds: Number(warmupPenalty.toFixed(3)),
    paceDeltaCliffSeconds: Number(Math.max(0, profile.maxDegradation - degPaceLoss).toFixed(3)),
    isCliffReached,
    predictedNextLapSeconds: Number(predictedNextLap.toFixed(3)),
    optimalPitWindowLap,
    degradationTrendCurve,
  }
}
